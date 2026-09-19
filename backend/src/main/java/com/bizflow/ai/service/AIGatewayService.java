package com.bizflow.ai.service;

import com.bizflow.ai.config.AiProperties;
import com.bizflow.ai.dto.AiMessageDto;
import com.bizflow.ai.dto.AiStatusResponse;
import com.bizflow.ai.provider.GeminiProvider;
import com.bizflow.ai.provider.OpenRouterProvider;
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
    private final OpenRouterProvider openRouterProvider;
    private final GeminiProvider geminiProvider;

    public record GenerationResult(String reply, String providerUsed, Integer tokensUsed) {}

    public GenerationResult generateResponse(String systemPrompt, List<AiMessageDto> history, String userPrompt) {
        if (!aiProperties.isEnabled()) {
            throw new IllegalStateException("AI Assistant is temporarily unavailable. Please try again.");
        }

        Exception openRouterException = null;
        Exception geminiException = null;

        // 1. PRIMARY: OpenRouter
        if (openRouterProvider.isConfigured()) {
            try {
                log.info("Attempting AI generation with primary provider: {}", openRouterProvider.getProviderName());
                String reply = openRouterProvider.generateCompletion(systemPrompt, history, userPrompt);
                if (reply != null && !reply.isBlank()) {
                    log.info("AI generation succeeded via primary provider {}", openRouterProvider.getProviderName());
                    return new GenerationResult(
                            reply,
                            openRouterProvider.getProviderName(),
                            estimateTokens(systemPrompt, userPrompt, reply)
                    );
                }
            } catch (Exception e) {
                log.warn("Primary AI provider (OpenRouter) failed: {}. Falling back to Gemini Free Tier.", e.getMessage());
                openRouterException = e;
            }
        } else {
            log.debug("OpenRouter is not configured. Skipping to Gemini Free Tier fallback.");
        }

        // 2. FALLBACK: Gemini Free Tier (gemini-2.5-flash-lite)
        if (geminiProvider.isConfigured()) {
            try {
                log.info("Attempting AI generation with fallback provider: {}", geminiProvider.getProviderName());
                String reply = geminiProvider.generateCompletion(systemPrompt, history, userPrompt);
                if (reply != null && !reply.isBlank()) {
                    log.info("AI generation succeeded via fallback provider {}", geminiProvider.getProviderName());
                    return new GenerationResult(
                            reply,
                            geminiProvider.getProviderName(),
                            estimateTokens(systemPrompt, userPrompt, reply)
                    );
                }
            } catch (Exception e) {
                log.warn("Fallback AI provider (Gemini Free Tier) failed: {}", e.getMessage());
                geminiException = e;
            }
        } else {
            log.debug("Gemini Free Tier is not configured.");
        }

        // 3. Both failed or unconfigured -> Provide grounded analytics response from real-time business telemetry
        log.warn("External AI providers unavailable (OpenRouter: {}, Gemini: {}). Serving grounded business analytics response.",
                openRouterException != null ? openRouterException.getMessage() : "Not configured",
                geminiException != null ? geminiException.getMessage() : "Not configured");

        String fallbackReply = buildGroundedFallbackReply(systemPrompt, userPrompt);
        return new GenerationResult(
                fallbackReply,
                "BizFlow Analytics Engine (Offline Fallback)",
                estimateTokens(systemPrompt, userPrompt, fallbackReply)
        );
    }

    private String buildGroundedFallbackReply(String systemPrompt, String userPrompt) {
        StringBuilder sb = new StringBuilder();
        sb.append("Here is the latest live business intelligence summary for your store:\n\n");

        if (systemPrompt != null && systemPrompt.contains("###")) {
            // Extract key summary metrics from system prompt
            String[] sections = systemPrompt.split("###");
            for (String section : sections) {
                String trimmed = section.trim();
                if (trimmed.startsWith("1. Business Profile") || trimmed.startsWith("2. Financial Performance") || trimmed.startsWith("3. Product & Inventory Status") || trimmed.startsWith("4. Customer Engagement")) {
                    sb.append("### ").append(trimmed).append("\n\n");
                }
            }
        } else {
            sb.append("• **Real-Time Data Sync Active**: All transactions and inventory movements are safely recorded.\n");
            sb.append("• **AI Assistant Tip**: To get in-depth LLM recommendations, please ensure your OpenRouter or Gemini API keys are active in business settings.\n");
        }

        return sb.toString().trim();
    }

    public AiStatusResponse getAiStatus() {
        boolean openRouterAvail = openRouterProvider.isConfigured();
        boolean geminiAvail = geminiProvider.isConfigured();

        List<String> available = new ArrayList<>();
        if (openRouterAvail) available.add(openRouterProvider.getProviderName());
        if (geminiAvail) available.add(geminiProvider.getProviderName());

        String activeProvider;
        if (openRouterAvail) {
            activeProvider = openRouterProvider.getProviderName();
        } else if (geminiAvail) {
            activeProvider = geminiProvider.getProviderName();
        } else {
            activeProvider = "AI Unavailable (Configuration Required)";
        }

        return AiStatusResponse.builder()
                .enabled(aiProperties.isEnabled())
                .activeProvider(activeProvider)
                .availableProviders(available)
                .openRouterAvailable(openRouterAvail)
                .geminiAvailable(geminiAvail)
                .groqAvailable(false)
                .fallbackAvailable(geminiAvail)
                .build();
    }

    private Integer estimateTokens(String system, String prompt, String reply) {
        int chars = (system != null ? system.length() : 0) +
                    (prompt != null ? prompt.length() : 0) +
                    (reply != null ? reply.length() : 0);
        return Math.max(1, chars / 4);
    }
}
