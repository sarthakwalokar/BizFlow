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
            throw new IllegalStateException("AI Assistant is currently disabled in system configuration.");
        }

        StringBuilder failureDiagnostics = new StringBuilder();

        // 1. PRIMARY: OpenRouter
        if (openRouterProvider != null && openRouterProvider.isConfigured()) {
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
                failureDiagnostics.append("OpenRouter returned an empty response. ");
            } catch (Exception e) {
                log.warn("Primary AI provider (OpenRouter) failed: {}. Continuing to Gemini fallback.", e.getMessage());
                failureDiagnostics.append("OpenRouter error: ").append(e.getMessage()).append(". ");
            }
        } else {
            log.info("Primary AI provider (OpenRouter) is not configured with an API key. Attempting Gemini fallback.");
            failureDiagnostics.append("OpenRouter API key is not configured. ");
        }

        // 2. LAST FALLBACK: Google Gemini
        if (geminiProvider != null && geminiProvider.isConfigured()) {
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
                failureDiagnostics.append("Gemini returned an empty response. ");
            } catch (Exception e) {
                log.error("Fallback AI provider (Gemini) failed: {}", e.getMessage());
                failureDiagnostics.append("Gemini error: ").append(e.getMessage()).append(". ");
            }
        } else {
            log.warn("Fallback AI provider (Gemini) is not configured with an API key.");
            failureDiagnostics.append("Gemini API key is not configured. ");
        }

        // 3. BOTH FAILED: Throw clear, actionable AI service error (no static/mock responses)
        String finalErrorMessage = "BizFlow AI Assistant is currently unavailable. "
                + "Please verify that the AI service is configured and reachable.";
        log.error("AI Generation failed across all providers: {}", failureDiagnostics.toString().trim());
        throw new RuntimeException(finalErrorMessage);
    }

    public AiStatusResponse getAiStatus() {
        boolean openRouterAvail = openRouterProvider != null && openRouterProvider.isConfigured();
        boolean geminiAvail = geminiProvider != null && geminiProvider.isConfigured();
        boolean aiEnabled = aiProperties.isEnabled() && (openRouterAvail || geminiAvail);

        List<String> available = aiEnabled ? List.of("BizFlow AI") : List.of();
        String activeProvider = aiEnabled ? "BizFlow AI" : "BizFlow AI (Offline)";

        return AiStatusResponse.builder()
                .enabled(aiProperties.isEnabled())
                .activeProvider(activeProvider)
                .availableProviders(available)
                .openRouterAvailable(openRouterAvail)
                .geminiAvailable(geminiAvail)
                .groqAvailable(false)
                .fallbackAvailable(false)
                .build();
    }

    private Integer estimateTokens(String system, String prompt, String reply) {
        int chars = (system != null ? system.length() : 0) +
                    (prompt != null ? prompt.length() : 0) +
                    (reply != null ? reply.length() : 0);
        return Math.max(1, chars / 4);
    }
}
