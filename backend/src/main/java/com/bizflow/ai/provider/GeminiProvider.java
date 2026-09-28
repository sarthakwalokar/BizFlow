package com.bizflow.ai.provider;

import com.bizflow.ai.config.AiProperties;
import com.bizflow.ai.dto.AiMessageDto;
import com.bizflow.ai.entity.AiRole;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class GeminiProvider implements AiProvider {

    private final AiProperties aiProperties;
    private final ObjectMapper objectMapper;

    @Override
    public String getProviderName() {
        String model = getEffectiveModelName();
        return "Gemini (" + model + ")";
    }

    @Override
    public boolean isConfigured() {
        return aiProperties.getGemini() != null && aiProperties.getGemini().isConfigured();
    }

    public String getEffectiveModelName() {
        String rawModel = aiProperties.getGemini().getEffectiveModel("gemini-1.5-flash");
        return rawModel.trim().replace("models/", "").toLowerCase();
    }

    @Override
    public String generateCompletion(String systemPrompt, List<AiMessageDto> history, String userPrompt) {
        AiProperties.ProviderConfig config = aiProperties.getGemini();
        if (!isConfigured()) {
            throw new IllegalStateException("Gemini API key is missing or not configured. Set the GEMINI_API_KEY environment variable.");
        }

        String apiKey = config.getEffectiveApiKey();
        String primaryModel = getEffectiveModelName();
        int timeoutMs = config.getTimeoutMs() > 0 ? config.getTimeoutMs() : 20000;

        List<String> modelsToTry = new ArrayList<>();
        if (!primaryModel.equals("gemini-pro") && !primaryModel.isEmpty()) {
            modelsToTry.add(primaryModel);
        }
        if (!modelsToTry.contains("gemini-1.5-flash")) modelsToTry.add("gemini-1.5-flash");
        if (!modelsToTry.contains("gemini-2.0-flash")) modelsToTry.add("gemini-2.0-flash");
        if (!modelsToTry.contains("gemini-2.5-flash")) modelsToTry.add("gemini-2.5-flash");
        if (!modelsToTry.contains("gemini-1.5-flash-8b")) modelsToTry.add("gemini-1.5-flash-8b");
        if (!modelsToTry.contains("gemini-1.5-pro")) modelsToTry.add("gemini-1.5-pro");

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofMillis(timeoutMs));
        requestFactory.setReadTimeout(Duration.ofMillis(timeoutMs));

        RestClient restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("x-goog-api-key", apiKey)
                .build();

        // Construct normalized Gemini contents with strict user/model alternation
        List<Map<String, Object>> contents = new ArrayList<>();
        String currentRole = null;
        StringBuilder currentPartText = new StringBuilder();

        // Process conversation history
        if (history != null) {
            for (AiMessageDto msg : history) {
                if (msg.getContent() == null || msg.getContent().isBlank()) continue;
                String role = msg.getRole() == AiRole.USER ? "user" : "model";

                if (currentRole == null) {
                    if ("model".equals(role)) {
                        // Gemini requires the conversation to start with a user message
                        continue;
                    }
                    currentRole = role;
                    currentPartText.append(msg.getContent().trim());
                } else if (currentRole.equals(role)) {
                    // Combine consecutive messages from the same role
                    currentPartText.append("\n\n").append(msg.getContent().trim());
                } else {
                    contents.add(Map.of(
                            "role", currentRole,
                            "parts", List.of(Map.of("text", currentPartText.toString()))
                    ));
                    currentRole = role;
                    currentPartText = new StringBuilder(msg.getContent().trim());
                }
            }
        }

        // Add current user prompt
        String sanitizedUserPrompt = (userPrompt != null && !userPrompt.isBlank()) ? userPrompt.trim() : "Please provide a business update.";
        if (currentRole == null || !"user".equals(currentRole)) {
            if (currentRole != null) {
                contents.add(Map.of(
                        "role", currentRole,
                        "parts", List.of(Map.of("text", currentPartText.toString()))
                ));
            }
            contents.add(Map.of(
                    "role", "user",
                    "parts", List.of(Map.of("text", sanitizedUserPrompt))
            ));
        } else {
            currentPartText.append("\n\n").append(sanitizedUserPrompt);
            contents.add(Map.of(
                    "role", "user",
                    "parts", List.of(Map.of("text", currentPartText.toString()))
            ));
        }

        Map<String, Object> requestBody = new HashMap<>();
        if (systemPrompt != null && !systemPrompt.trim().isEmpty()) {
            requestBody.put("systemInstruction", Map.of(
                    "parts", List.of(Map.of("text", systemPrompt.trim()))
            ));
        }
        requestBody.put("contents", contents);
        requestBody.put("generationConfig", Map.of(
                "temperature", 0.3,
                "maxOutputTokens", 2048
        ));

        Exception lastException = null;

        for (String model : modelsToTry) {
            try {
                String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;
                log.debug("Attempting Gemini completion with model: {}", model);

                String responseJson = restClient.post()
                        .uri(url)
                        .body(requestBody)
                        .retrieve()
                        .body(String.class);

                if (responseJson == null || responseJson.isBlank()) {
                    continue;
                }

                JsonNode root = objectMapper.readTree(responseJson);

                if (root.has("error")) {
                    String errorMsg = root.path("error").path("message").asText();
                    log.warn("Gemini API returned error for model {}: {}", model, errorMsg);
                    lastException = new RuntimeException("Gemini API error: " + errorMsg);
                    continue;
                }

                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && !candidates.isEmpty()) {
                    JsonNode parts = candidates.get(0).path("content").path("parts");
                    if (parts.isArray() && !parts.isEmpty()) {
                        StringBuilder textBuilder = new StringBuilder();
                        for (JsonNode part : parts) {
                            if (part.has("text")) {
                                textBuilder.append(part.path("text").asText());
                            }
                        }
                        String responseText = textBuilder.toString().trim();
                        if (!responseText.isEmpty()) {
                            log.info("Gemini completion succeeded with model: {}", model);
                            return responseText;
                        }
                    }
                }
            } catch (HttpStatusCodeException e) {
                String errorBody = e.getResponseBodyAsString();
                log.warn("Gemini HTTP error ({}) for model {}: {}", e.getStatusCode().value(), model, errorBody);
                lastException = e;
                if (e.getStatusCode().value() == 401
                        || (e.getStatusCode().value() == 400 && errorBody.contains("API_KEY_INVALID"))
                        || errorBody.contains("UNAUTHENTICATED")) {
                    throw new IllegalStateException("The configured Gemini API key is invalid or unauthorized.");
                }
            } catch (Exception e) {
                log.warn("Gemini completion failed for model {}: {}", model, e.getMessage());
                lastException = e;
            }
        }

        throw new RuntimeException("Gemini generation error: " + (lastException != null ? lastException.getMessage() : "All Gemini models unavailable"), lastException);
    }
}
