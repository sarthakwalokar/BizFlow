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
public class GroqProvider implements AiProvider {

    private final AiProperties aiProperties;
    private final ObjectMapper objectMapper;

    @Override
    public String getProviderName() {
        return "Groq (" + aiProperties.getGroq().getModel() + ")";
    }

    @Override
    public boolean isConfigured() {
        return aiProperties.getGroq().isConfigured();
    }

    @Override
    public String generateCompletion(String systemPrompt, List<AiMessageDto> history, String userPrompt) {
        AiProperties.ProviderConfig config = aiProperties.getGroq();
        if (!config.isConfigured()) {
            throw new IllegalStateException("Groq API key is not configured.");
        }

        try {
            RestClient restClient = RestClient.builder()
                    .baseUrl(config.getBaseUrl())
                    .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + config.getApiKey())
                    .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .build();

            List<Map<String, String>> messages = new ArrayList<>();

            if (systemPrompt != null && !systemPrompt.trim().isEmpty()) {
                messages.add(Map.of("role", "system", "content", systemPrompt));
            }

            if (history != null && !history.isEmpty()) {
                for (AiMessageDto msg : history) {
                    String role = msg.getRole() == AiRole.USER ? "user" : "assistant";
                    messages.add(Map.of("role", role, "content", msg.getContent()));
                }
            }

            messages.add(Map.of("role", "user", "content", userPrompt));

            Map<String, Object> requestBody = Map.of(
                    "model", config.getModel(),
                    "messages", messages,
                    "temperature", 0.3,
                    "max_tokens", 2048
            );

            String responseJson = restClient.post()
                    .uri("/chat/completions")
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            if (responseJson == null || responseJson.isBlank()) {
                throw new RuntimeException("Empty response received from Groq API.");
            }

            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode choices = root.path("choices");
            if (choices.isArray() && !choices.isEmpty()) {
                JsonNode messageNode = choices.get(0).path("message");
                String content = messageNode.path("content").asText();
                if (content != null && !content.isBlank()) {
                    return content;
                }
            }

            throw new RuntimeException("Unexpected response format from Groq API: " + responseJson);
        } catch (Exception e) {
            log.warn("Groq AI completion failed: {}", e.getMessage());
            throw new RuntimeException("Groq generation error: " + e.getMessage(), e);
        }
    }
}
