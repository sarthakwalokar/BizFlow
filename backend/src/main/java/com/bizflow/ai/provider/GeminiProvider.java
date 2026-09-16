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
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClient;

import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class GeminiProvider implements AiProvider {

    private final AiProperties aiProperties;
    private final ObjectMapper objectMapper;

    // Ordered list of candidate Gemini models to try if the primary is retired or unavailable
    private static final List<String> FALLBACK_GEMINI_MODELS = List.of(
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash",
            "gemini-1.5-flash-8b",
            "gemini-2.5-pro",
            "gemini-1.5-pro",
            "gemini-pro"
    );

    private volatile String lastWorkingModel = null;

    @Override
    public String getProviderName() {
        String model = lastWorkingModel != null ? lastWorkingModel : aiProperties.getGemini().getModel();
        return "Google Gemini (" + (model != null && !model.isBlank() ? model : "gemini-1.5-flash") + ")";
    }

    @Override
    public boolean isConfigured() {
        return aiProperties.getGemini().isConfigured();
    }

    @Override
    public String generateCompletion(String systemPrompt, List<AiMessageDto> history, String userPrompt) {
        AiProperties.ProviderConfig config = aiProperties.getGemini();
        if (!config.isConfigured()) {
            throw new IllegalStateException("Google Gemini API key is missing or not configured. Please set the GEMINI_API_KEY or BIZFLOW_AI_GEMINI_API_KEY environment variable.");
        }

        String apiKey = config.getApiKey().trim();
        String configuredModel = config.getModel() != null && !config.getModel().isBlank()
                ? config.getModel().trim().replace("models/", "")
                : "gemini-1.5-flash";

        // Build list of models to try (configured / last working first, then fallback list)
        LinkedHashSet<String> modelsToTry = new LinkedHashSet<>();
        if (lastWorkingModel != null) {
            modelsToTry.add(lastWorkingModel);
        }
        modelsToTry.add(configuredModel);
        modelsToTry.addAll(FALLBACK_GEMINI_MODELS);

        RestClient restClient = RestClient.builder()
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("x-goog-api-key", apiKey)
                .build();

        // Construct Gemini request body
        Map<String, Object> requestBody = new HashMap<>();

        if (systemPrompt != null && !systemPrompt.trim().isEmpty()) {
            requestBody.put("system_instruction", Map.of(
                    "parts", List.of(Map.of("text", systemPrompt))
            ));
        }

        List<Map<String, Object>> contents = new ArrayList<>();

        // Add history if present
        if (history != null && !history.isEmpty()) {
            for (AiMessageDto msg : history) {
                String role = msg.getRole() == AiRole.USER ? "user" : "model";
                contents.add(Map.of(
                        "role", role,
                        "parts", List.of(Map.of("text", msg.getContent()))
                ));
            }
        }

        // Add current user prompt
        contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", userPrompt))
        ));

        requestBody.put("contents", contents);
        requestBody.put("generationConfig", Map.of(
                "temperature", 0.7,
                "maxOutputTokens", 2048
        ));

        Exception lastException = null;

        for (String model : modelsToTry) {
            try {
                // Ensure full explicit URL to prevent URI path stripping in RestClient
                String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;
                log.debug("Attempting Gemini completion with model: {}", model);

                String responseJson = restClient.post()
                        .uri(url)
                        .body(requestBody)
                        .retrieve()
                        .body(String.class);

                if (responseJson == null || responseJson.isBlank()) {
                    throw new RuntimeException("Empty response received from Google Gemini API.");
                }

                JsonNode root = objectMapper.readTree(responseJson);
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && !candidates.isEmpty()) {
                    JsonNode parts = candidates.get(0).path("content").path("parts");
                    if (parts.isArray() && !parts.isEmpty()) {
                        lastWorkingModel = model;
                        log.info("Google Gemini completion succeeded with model: {}", model);
                        return parts.get(0).path("text").asText();
                    }
                }

                throw new RuntimeException("Unexpected response format from Google Gemini API: " + responseJson);
            } catch (HttpStatusCodeException e) {
                String errorBody = e.getResponseBodyAsString();
                log.warn("Gemini HTTP error ({}) for model {}: {}", e.getStatusCode().value(), model, errorBody);
                String extractedMsg = extractErrorMessage(errorBody);

                if (e.getStatusCode().value() == 400 && errorBody.contains("API_KEY_INVALID")) {
                    throw new IllegalStateException("The configured Google Gemini API key is invalid. Please verify your GEMINI_API_KEY.");
                } else if (e.getStatusCode().value() == 429 || errorBody.contains("RESOURCE_EXHAUSTED")) {
                    throw new IllegalStateException("Google Gemini API quota/rate limit reached. Please check your Gemini account limits.");
                } else if (e.getStatusCode().value() == 404 || (extractedMsg != null && extractedMsg.contains("not found"))) {
                    // Model not found on this endpoint/version, continue loop to try next model
                    lastException = new RuntimeException("Google Gemini model '" + model + "' not available: " + extractedMsg, e);
                    continue;
                }

                lastException = new RuntimeException("Google Gemini API error (" + e.getStatusCode().value() + "): " + (extractedMsg != null ? extractedMsg : e.getMessage()), e);
            } catch (Exception e) {
                log.warn("Gemini AI completion failed for model {}: {}", model, e.getMessage());
                lastException = e;
            }
        }

        throw new RuntimeException(lastException != null ? lastException.getMessage() : "All Gemini model endpoints failed.");
    }

    private String extractErrorMessage(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode messageNode = root.path("error").path("message");
            if (!messageNode.isMissingNode()) {
                return messageNode.asText();
            }
        } catch (Exception ignored) {}
        return null;
    }
}
