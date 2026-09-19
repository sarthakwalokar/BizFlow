package com.bizflow.ai.service;

import com.bizflow.ai.config.AiProperties;
import com.bizflow.ai.dto.AiMessageDto;
import com.bizflow.ai.dto.AiStatusResponse;
import com.bizflow.ai.provider.GeminiProvider;
import com.bizflow.ai.provider.OpenRouterProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AIGatewayServiceTest {

    @Mock
    private AiProperties aiProperties;

    @Mock
    private OpenRouterProvider openRouterProvider;

    @Mock
    private GeminiProvider geminiProvider;

    @InjectMocks
    private AIGatewayService aiGatewayService;

    @Test
    void testOpenRouterPrimary_Success() {
        when(aiProperties.isEnabled()).thenReturn(true);
        when(openRouterProvider.isConfigured()).thenReturn(true);
        when(openRouterProvider.getProviderName()).thenReturn("OpenRouter (meta-llama/llama-3.3-70b-instruct)");
        when(openRouterProvider.generateCompletion(anyString(), anyList(), anyString()))
                .thenReturn("Primary AI response: Sales are up 15%.");

        AIGatewayService.GenerationResult result = aiGatewayService.generateResponse(
                "System prompt", List.of(), "How were sales?"
        );

        assertNotNull(result);
        assertEquals("Primary AI response: Sales are up 15%.", result.reply());
        assertEquals("OpenRouter (meta-llama/llama-3.3-70b-instruct)", result.providerUsed());
        verify(openRouterProvider, times(1)).generateCompletion(anyString(), anyList(), anyString());
        verify(geminiProvider, never()).generateCompletion(anyString(), anyList(), anyString());
    }

    @Test
    void testOpenRouterFailure_FallsBackToGeminiFreeTier() {
        when(aiProperties.isEnabled()).thenReturn(true);
        when(openRouterProvider.isConfigured()).thenReturn(true);
        when(openRouterProvider.getProviderName()).thenReturn("OpenRouter (meta-llama/llama-3.3-70b-instruct)");
        when(openRouterProvider.generateCompletion(anyString(), anyList(), anyString()))
                .thenThrow(new RuntimeException("OpenRouter 503 Overloaded"));

        when(geminiProvider.isConfigured()).thenReturn(true);
        when(geminiProvider.getProviderName()).thenReturn("Gemini Free Tier (gemini-2.5-flash-lite)");
        when(geminiProvider.generateCompletion(anyString(), anyList(), anyString()))
                .thenReturn("Fallback Gemini AI response: Sales are up 15%.");

        AIGatewayService.GenerationResult result = aiGatewayService.generateResponse(
                "System prompt", List.of(), "How were sales?"
        );

        assertNotNull(result);
        assertEquals("Fallback Gemini AI response: Sales are up 15%.", result.reply());
        assertEquals("Gemini Free Tier (gemini-2.5-flash-lite)", result.providerUsed());
        verify(openRouterProvider, times(1)).generateCompletion(anyString(), anyList(), anyString());
        verify(geminiProvider, times(1)).generateCompletion(anyString(), anyList(), anyString());
    }

    @Test
    void testBothProvidersFail_ThrowsFriendlyError() {
        when(aiProperties.isEnabled()).thenReturn(true);
        when(openRouterProvider.isConfigured()).thenReturn(true);
        when(openRouterProvider.generateCompletion(anyString(), anyList(), anyString()))
                .thenThrow(new RuntimeException("OpenRouter error"));

        when(geminiProvider.isConfigured()).thenReturn(true);
        when(geminiProvider.generateCompletion(anyString(), anyList(), anyString()))
                .thenThrow(new RuntimeException("Gemini quota exhausted"));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            aiGatewayService.generateResponse("System prompt", List.of(), "Top products?");
        });

        assertEquals("AI Assistant is temporarily unavailable. Please try again.", ex.getMessage());
    }

    @Test
    void testNeitherConfigured_ThrowsFriendlyError() {
        when(aiProperties.isEnabled()).thenReturn(true);
        when(openRouterProvider.isConfigured()).thenReturn(false);
        when(geminiProvider.isConfigured()).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            aiGatewayService.generateResponse("System prompt", List.of(), "Expenses?");
        });

        assertEquals("AI Assistant is temporarily unavailable. Please try again.", ex.getMessage());
    }

    @Test
    void testGetAiStatus_WhenOpenRouterConfigured() {
        when(aiProperties.isEnabled()).thenReturn(true);
        when(openRouterProvider.isConfigured()).thenReturn(true);
        when(openRouterProvider.getProviderName()).thenReturn("OpenRouter (meta-llama/llama-3.3-70b-instruct)");
        when(geminiProvider.isConfigured()).thenReturn(true);
        when(geminiProvider.getProviderName()).thenReturn("Gemini Free Tier (gemini-2.5-flash-lite)");

        AiStatusResponse status = aiGatewayService.getAiStatus();

        assertNotNull(status);
        assertTrue(status.isEnabled());
        assertTrue(status.isOpenRouterAvailable());
        assertTrue(status.isGeminiAvailable());
        assertFalse(status.isGroqAvailable());
        assertEquals("OpenRouter (meta-llama/llama-3.3-70b-instruct)", status.getActiveProvider());
    }
}
