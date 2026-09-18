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

    // Set of deprecated/retired models that should be automatically upgraded to modern equivalents
    private static final Set<String> RETIRED_MODELS = Set.of(
            "gemini-pro",
            "gemini-1.0-pro",
            "gemini-1.5-pro",
            "gemini-1.5-flash",
            "gemini-1.5-flash-8b",
            "gemini-2.0-flash",
            "gemini-2.5-flash",
            "gemini-2.5-pro"
    );

    // Ordered list of candidate active Gemini models to try
    private static final List<String> FALLBACK_GEMINI_MODELS = List.of(
            "gemini-3.8-flash",
            "gemini-3.6-flash",
            "gemini-3.7-flash",
            "gemini-flash-latest",
            "gemini-3.5-flash",
            "gemini-3.1-pro-preview"
    );

    private volatile String lastWorkingModel = null;

    @Override
    public String getProviderName() {
        return "BizFlow AI Engine";
    }

    @Override
    public boolean isConfigured() {
        return aiProperties.getGemini().isConfigured();
    }

    @Override
    public String generateCompletion(String systemPrompt, List<AiMessageDto> history, String userPrompt) {
        AiProperties.ProviderConfig config = aiProperties.getGemini();
        if (!config.isConfigured()) {
            throw new IllegalStateException("BizFlow AI API key is missing or not configured. Please set the BIZFLOW_AI_GEMINI_API_KEY or GEMINI_API_KEY environment variable.");
        }

        String apiKey = config.getApiKey().trim();
        String rawModel = config.getModel() != null && !config.getModel().isBlank()
                ? config.getModel().trim().replace("models/", "").toLowerCase()
                : "gemini-3.8-flash";

        // Auto-upgrade obsolete or retired model names
        String configuredModel = RETIRED_MODELS.contains(rawModel) ? "gemini-3.8-flash" : rawModel;

        // Build list of models to try (configured / last working first, then fallback list)
        LinkedHashSet<String> modelsToTry = new LinkedHashSet<>();
        if (lastWorkingModel != null && !RETIRED_MODELS.contains(lastWorkingModel)) {
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
                    throw new RuntimeException("Empty response received from AI service.");
                }

                JsonNode root = objectMapper.readTree(responseJson);
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && !candidates.isEmpty()) {
                    JsonNode parts = candidates.get(0).path("content").path("parts");
                    if (parts.isArray() && !parts.isEmpty()) {
                        lastWorkingModel = model;
                        log.info("BizFlow AI completion succeeded with model: {}", model);
                        return parts.get(0).path("text").asText();
                    }
                }

                throw new RuntimeException("Unexpected response format from AI service: " + responseJson);
            } catch (HttpStatusCodeException e) {
                String errorBody = e.getResponseBodyAsString();
                log.warn("AI HTTP error ({}) for model {}: {}", e.getStatusCode().value(), model, errorBody);
                String extractedMsg = extractErrorMessage(errorBody);

                if (e.getStatusCode().value() == 401
                        || (e.getStatusCode().value() == 400 && errorBody.contains("API_KEY_INVALID"))
                        || errorBody.contains("UNAUTHENTICATED")
                        || errorBody.contains("ACCESS_TOKEN_TYPE_UNSUPPORTED")
                        || errorBody.contains("invalid authentication credentials")) {
                    throw new IllegalStateException("The configured AI API key is invalid or unrecognized. Please provide a valid API key in your .env file.");
                } else if (e.getStatusCode().value() == 429 || errorBody.contains("RESOURCE_EXHAUSTED")) {
                    throw new IllegalStateException("AI service quota/rate limit reached. Please check your account limits or retry shortly.");
                } else if (e.getStatusCode().value() == 503 || errorBody.contains("UNAVAILABLE") || errorBody.contains("high demand")) {
                    // Temporary 503 spike on this model, continue to try next fallback model
                    lastException = new RuntimeException("AI engine is currently experiencing high demand. Please try again in a moment.", e);
                    continue;
                } else if (e.getStatusCode().value() == 404 || (extractedMsg != null && extractedMsg.contains("not found"))) {
                    // Model not found on this endpoint/version, continue loop to try next model
                    lastException = new RuntimeException("AI model '" + model + "' not available: " + extractedMsg, e);
                    continue;
                }

                lastException = new RuntimeException("AI service error (" + e.getStatusCode().value() + "): " + (extractedMsg != null ? extractedMsg : e.getMessage()), e);
            } catch (Exception e) {
                log.warn("AI completion failed for model {}: {}", model, e.getMessage());
                lastException = e;
            }
        }

        throw new RuntimeException(lastException != null ? lastException.getMessage() : "All AI model endpoints failed.");
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
