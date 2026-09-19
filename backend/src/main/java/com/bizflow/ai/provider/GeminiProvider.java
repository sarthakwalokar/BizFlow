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

    @Override
    public String getProviderName() {
        String model = getFreeTierModelName();
        return "Gemini Free Tier (" + model + ")";
    }

    @Override
    public boolean isConfigured() {
        return aiProperties.getGemini().isConfigured();
    }

    public String getFreeTierModelName() {
        String rawModel = aiProperties.getGemini().getModel();
        if (rawModel == null || rawModel.isBlank()) {
            return "gemini-2.5-flash-lite";
        }
        String cleaned = rawModel.trim().replace("models/", "").toLowerCase();
        // Prevent accidental paid model configuration
        if (cleaned.contains("pro") || cleaned.contains("ultra") || cleaned.contains("advanced")) {
            log.warn("Configured Gemini model '{}' is not a free-tier model. Defaulting to free-tier 'gemini-2.5-flash-lite'.", cleaned);
            return "gemini-2.5-flash-lite";
        }
        return cleaned;
    }

    @Override
    public String generateCompletion(String systemPrompt, List<AiMessageDto> history, String userPrompt) {
        AiProperties.ProviderConfig config = aiProperties.getGemini();
        if (!config.isConfigured()) {
            throw new IllegalStateException("Gemini API key is missing or not configured. Set the GEMINI_API_KEY environment variable.");
        }

        String apiKey = config.getApiKey().trim();
        String model = getFreeTierModelName();

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

        // Add conversation history if present
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
                "temperature", 0.3,
                "maxOutputTokens", 2048
        ));

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;
            log.debug("Attempting Gemini Free Tier completion with model: {}", model);

            String responseJson = restClient.post()
                    .uri(url)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            if (responseJson == null || responseJson.isBlank()) {
                throw new RuntimeException("Empty response received from Gemini AI Free Tier.");
            }

            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    log.info("Gemini Free Tier completion succeeded with model: {}", model);
                    return parts.get(0).path("text").asText();
                }
            }

            throw new RuntimeException("Unexpected response format from Gemini AI: " + responseJson);
        } catch (HttpStatusCodeException e) {
            String errorBody = e.getResponseBodyAsString();
            log.warn("Gemini HTTP error ({}) for model {}: {}", e.getStatusCode().value(), model, errorBody);
            String extractedMsg = extractErrorMessage(errorBody);

            if (e.getStatusCode().value() == 401
                    || (e.getStatusCode().value() == 400 && errorBody.contains("API_KEY_INVALID"))
                    || errorBody.contains("UNAUTHENTICATED")) {
                throw new IllegalStateException("The configured Gemini API key is invalid or unauthorized.");
            } else if (e.getStatusCode().value() == 429 || errorBody.contains("RESOURCE_EXHAUSTED")) {
                throw new IllegalStateException("Gemini Free Tier quota/rate limit reached. Please retry shortly.");
            }

            throw new RuntimeException("Gemini service error (" + e.getStatusCode().value() + "): " + (extractedMsg != null ? extractedMsg : e.getMessage()), e);
        } catch (Exception e) {
            log.warn("Gemini Free Tier completion failed for model {}: {}", model, e.getMessage());
            throw new RuntimeException("Gemini generation error: " + e.getMessage(), e);
        }
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
