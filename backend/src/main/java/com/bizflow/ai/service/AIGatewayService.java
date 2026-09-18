package com.bizflow.ai.service;

import com.bizflow.ai.config.AiProperties;
import com.bizflow.ai.dto.AiMessageDto;
import com.bizflow.ai.dto.AiStatusResponse;
import com.bizflow.ai.provider.GeminiProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIGatewayService {

    private final AiProperties aiProperties;
    private final GeminiProvider geminiProvider;

    public record GenerationResult(String reply, String providerUsed, Integer tokensUsed) {}

    public GenerationResult generateResponse(String systemPrompt, List<AiMessageDto> history, String userPrompt) {
        if (!geminiProvider.isConfigured()) {
            log.warn("AI API key is not configured. Request cannot be processed.");
            throw new IllegalStateException("BizFlow AI API key is required but not configured. Please set the BIZFLOW_AI_GEMINI_API_KEY or GEMINI_API_KEY environment variable.");
        }

        try {
            log.info("Processing AI request with {}", geminiProvider.getProviderName());
            String reply = geminiProvider.generateCompletion(systemPrompt, history, userPrompt);
            return new GenerationResult(reply, geminiProvider.getProviderName(), estimateTokens(systemPrompt, userPrompt, reply));
        } catch (Exception e) {
            log.error("BizFlow AI generation failed: {}", e.getMessage());
            throw new RuntimeException("AI generation failed: " + e.getMessage(), e);
        }
    }

    public AiStatusResponse getAiStatus() {
        boolean aiAvail = geminiProvider.isConfigured();

        return AiStatusResponse.builder()
                .enabled(aiProperties.isEnabled())
                .activeProvider(aiAvail ? geminiProvider.getProviderName() : "BizFlow AI (Key Required)")
                .availableProviders(aiAvail ? List.of("BizFlow AI Engine") : List.of())
                .geminiAvailable(aiAvail)
                .groqAvailable(false)
                .openRouterAvailable(false)
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
