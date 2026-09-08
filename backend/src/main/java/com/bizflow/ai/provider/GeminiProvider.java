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
        return "Google Gemini (" + aiProperties.getGemini().getModel() + ")";
    }

    @Override
    public boolean isConfigured() {
        return aiProperties.getGemini().isConfigured();
    }

    @Override
    public String generateCompletion(String systemPrompt, List<AiMessageDto> history, String userPrompt) {
        AiProperties.ProviderConfig config = aiProperties.getGemini();
        if (!config.isConfigured()) {
            throw new IllegalStateException("Gemini API key is not configured.");
        }

        try {
            RestClient restClient = RestClient.builder()
                    .baseUrl(config.getBaseUrl())
                    .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
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
                    "temperature", 0.3,
                    "maxOutputTokens", 2048
            ));

            String uri = "/models/" + config.getModel() + ":generateContent?key=" + config.getApiKey();

            String responseJson = restClient.post()
                    .uri(uri)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            if (responseJson == null || responseJson.isBlank()) {
                throw new RuntimeException("Empty response received from Gemini API.");
            }

            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText();
                }
            }

            throw new RuntimeException("Unexpected response format from Gemini API: " + responseJson);
        } catch (Exception e) {
            log.warn("Gemini AI completion failed: {}", e.getMessage());
            throw new RuntimeException("Gemini generation error: " + e.getMessage(), e);
        }
    }
}
