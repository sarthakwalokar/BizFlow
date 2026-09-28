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
import org.springframework.web.client.RestClientResponseException;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OpenRouterProvider implements AiProvider {

    private final AiProperties aiProperties;
    private final ObjectMapper objectMapper;

    @Override
    public String getProviderName() {
        return "BizFlow AI";
    }

    @Override
    public boolean isConfigured() {
        return aiProperties.getOpenrouter() != null && aiProperties.getOpenrouter().isConfigured();
    }

    @Override
    public String generateCompletion(String systemPrompt, List<AiMessageDto> history, String userPrompt) {
        AiProperties.ProviderConfig config = aiProperties.getOpenrouter();
        if (!isConfigured()) {
            throw new IllegalStateException("OpenRouter API key is not configured.");
        }

        String apiKey = config.getEffectiveApiKey();
        String model = config.getEffectiveModel("meta-llama/llama-3.3-70b-instruct");
        int timeoutMs = config.getTimeoutMs() > 0 ? config.getTimeoutMs() : 20000;

        try {
            SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
            requestFactory.setConnectTimeout(Duration.ofMillis(timeoutMs));
            requestFactory.setReadTimeout(Duration.ofMillis(timeoutMs));

            RestClient restClient = RestClient.builder()
                    .requestFactory(requestFactory)
                    .baseUrl(config.getBaseUrl())
                    .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .defaultHeader("HTTP-Referer", "https://bizflow.app")
                    .defaultHeader("X-Title", "BizFlow AI Business Assistant")
                    .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .build();

            List<Map<String, String>> messages = new ArrayList<>();

            if (systemPrompt != null && !systemPrompt.trim().isEmpty()) {
                messages.add(Map.of("role", "system", "content", systemPrompt.trim()));
            }

            if (history != null && !history.isEmpty()) {
                for (AiMessageDto msg : history) {
                    if (msg.getContent() != null && !msg.getContent().isBlank()) {
                        String role = msg.getRole() == AiRole.USER ? "user" : "assistant";
                        messages.add(Map.of("role", role, "content", msg.getContent().trim()));
                    }
                }
            }

            if (userPrompt != null && !userPrompt.isBlank()) {
                messages.add(Map.of("role", "user", "content", userPrompt.trim()));
            }

            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "messages", messages,
                    "temperature", 0.3,
                    "max_tokens", 2048
            );

            log.info("Dispatching completion request to OpenRouter (Model: {}, BaseURL: {})", model, config.getBaseUrl());

            String responseJson = restClient.post()
                    .uri("/chat/completions")
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            if (responseJson == null || responseJson.isBlank()) {
                throw new RuntimeException("Empty response received from OpenRouter API.");
            }

            JsonNode root = objectMapper.readTree(responseJson);

            if (root.has("error")) {
                String errorMsg = root.path("error").path("message").asText();
                log.warn("OpenRouter API returned error payload: {}", errorMsg);
                throw new RuntimeException("OpenRouter API error: " + errorMsg);
            }

            JsonNode choices = root.path("choices");
            if (choices.isArray() && !choices.isEmpty()) {
                JsonNode messageNode = choices.get(0).path("message");
                String content = messageNode.path("content").asText();
                if (content != null && !content.isBlank()) {
                    return content;
                }
            }

            throw new RuntimeException("Unexpected response format from OpenRouter API: " + responseJson);
        } catch (RestClientResponseException e) {
            String responseBody = e.getResponseBodyAsString();
            log.warn("OpenRouter HTTP error (Status {}): {}", e.getStatusCode(), responseBody);
            throw new RuntimeException("OpenRouter HTTP " + e.getStatusCode() + ": " + responseBody, e);
        } catch (Exception e) {
            log.warn("OpenRouter AI completion failed: {}", e.getMessage());
            throw new RuntimeException("OpenRouter generation error: " + e.getMessage(), e);
        }
    }
}
