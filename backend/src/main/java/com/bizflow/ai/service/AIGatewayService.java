package com.bizflow.ai.service;

import com.bizflow.ai.config.AiProperties;
import com.bizflow.ai.dto.AiMessageDto;
import com.bizflow.ai.dto.AiStatusResponse;
import com.bizflow.ai.provider.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIGatewayService {

    private final AiProperties aiProperties;
    private final GeminiProvider geminiProvider;
    private final GroqProvider groqProvider;
    private final OpenRouterProvider openRouterProvider;
    private final DeterministicAdvisorProvider deterministicAdvisorProvider;

    public record GenerationResult(String reply, String providerUsed, Integer tokensUsed) {}

    public GenerationResult generateResponse(String systemPrompt, List<AiMessageDto> history, String userPrompt) {
        if (!aiProperties.isEnabled()) {
            log.info("AI features are globally disabled. Using deterministic advisor.");
            String reply = deterministicAdvisorProvider.generateCompletion(systemPrompt, history, userPrompt);
            return new GenerationResult(reply, deterministicAdvisorProvider.getProviderName(), null);
        }

        // Priority 1: Gemini
        if (geminiProvider.isConfigured()) {
            try {
                log.info("Attempting completion with Priority 1: {}", geminiProvider.getProviderName());
                String reply = geminiProvider.generateCompletion(systemPrompt, history, userPrompt);
                return new GenerationResult(reply, geminiProvider.getProviderName(), estimateTokens(systemPrompt, userPrompt, reply));
            } catch (Exception e) {
                log.warn("Gemini provider failed ({}). Falling back to next configured provider...", e.getMessage());
            }
        }

        // Priority 2: Groq
        if (groqProvider.isConfigured()) {
            try {
                log.info("Attempting completion with Priority 2: {}", groqProvider.getProviderName());
                String reply = groqProvider.generateCompletion(systemPrompt, history, userPrompt);
                return new GenerationResult(reply, groqProvider.getProviderName(), estimateTokens(systemPrompt, userPrompt, reply));
            } catch (Exception e) {
                log.warn("Groq provider failed ({}). Falling back to next configured provider...", e.getMessage());
            }
        }

        // Priority 3: OpenRouter
        if (openRouterProvider.isConfigured()) {
            try {
                log.info("Attempting completion with Priority 3: {}", openRouterProvider.getProviderName());
                String reply = openRouterProvider.generateCompletion(systemPrompt, history, userPrompt);
                return new GenerationResult(reply, openRouterProvider.getProviderName(), estimateTokens(systemPrompt, userPrompt, reply));
            } catch (Exception e) {
                log.warn("OpenRouter provider failed ({}). Falling back to deterministic advisor...", e.getMessage());
            }
        }

        // Fallback: Deterministic Rule Engine
        log.info("All remote providers unconfigured or failed. Using local deterministic advisor fallback.");
        String fallbackReply = deterministicAdvisorProvider.generateCompletion(systemPrompt, history, userPrompt);
        return new GenerationResult(fallbackReply, deterministicAdvisorProvider.getProviderName(), null);
    }

    public AiStatusResponse getAiStatus() {
        boolean geminiAvail = geminiProvider.isConfigured();
        boolean groqAvail = groqProvider.isConfigured();
        boolean openRouterAvail = openRouterProvider.isConfigured();

        List<String> available = new ArrayList<>();
        if (geminiAvail) available.add("Gemini");
        if (groqAvail) available.add("Groq");
        if (openRouterAvail) available.add("OpenRouter");
        available.add("Deterministic Engine");

        String activeProvider;
        if (geminiAvail) {
            activeProvider = geminiProvider.getProviderName();
        } else if (groqAvail) {
            activeProvider = groqProvider.getProviderName();
        } else if (openRouterAvail) {
            activeProvider = openRouterProvider.getProviderName();
        } else {
            activeProvider = deterministicAdvisorProvider.getProviderName();
        }

        return AiStatusResponse.builder()
                .enabled(aiProperties.isEnabled())
                .activeProvider(activeProvider)
                .availableProviders(available)
                .geminiAvailable(geminiAvail)
                .groqAvailable(groqAvail)
                .openRouterAvailable(openRouterAvail)
                .fallbackAvailable(true)
                .build();
    }

    private Integer estimateTokens(String system, String prompt, String reply) {
        int chars = (system != null ? system.length() : 0) +
                    (prompt != null ? prompt.length() : 0) +
                    (reply != null ? reply.length() : 0);
        return Math.max(1, chars / 4);
    }
}
