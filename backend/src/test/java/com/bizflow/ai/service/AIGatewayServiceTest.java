package com.bizflow.ai.service;

import com.bizflow.ai.config.AiProperties;
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
        when(openRouterProvider.getProviderName()).thenReturn("BizFlow AI");
        when(openRouterProvider.generateCompletion(anyString(), anyList(), anyString()))
                .thenReturn("Primary AI response: Sales are up 15%.");

        AIGatewayService.GenerationResult result = aiGatewayService.generateResponse(
                "System prompt", List.of(), "How were sales?"
        );

        assertNotNull(result);
        assertEquals("Primary AI response: Sales are up 15%.", result.reply());
        assertEquals("BizFlow AI", result.providerUsed());
        verify(openRouterProvider, times(1)).generateCompletion(anyString(), anyList(), anyString());
        verify(geminiProvider, never()).generateCompletion(anyString(), anyList(), anyString());
    }

    @Test
    void testOpenRouterFailure_FallsBackToGemini() {
        when(aiProperties.isEnabled()).thenReturn(true);
        when(openRouterProvider.isConfigured()).thenReturn(true);
        when(openRouterProvider.generateCompletion(anyString(), anyList(), anyString()))
                .thenThrow(new RuntimeException("OpenRouter 503 Overloaded"));

        when(geminiProvider.isConfigured()).thenReturn(true);
        when(geminiProvider.getProviderName()).thenReturn("BizFlow AI");
        when(geminiProvider.generateCompletion(anyString(), anyList(), anyString()))
                .thenReturn("Fallback Gemini AI response: Sales are up 15%.");

        AIGatewayService.GenerationResult result = aiGatewayService.generateResponse(
                "System prompt", List.of(), "How were sales?"
        );

        assertNotNull(result);
        assertEquals("Fallback Gemini AI response: Sales are up 15%.", result.reply());
        assertEquals("BizFlow AI", result.providerUsed());
        verify(openRouterProvider, times(1)).generateCompletion(anyString(), anyList(), anyString());
        verify(geminiProvider, times(1)).generateCompletion(anyString(), anyList(), anyString());
    }

    @Test
    void testBothProvidersFail_ThrowsClearException() {
        when(aiProperties.isEnabled()).thenReturn(true);
        when(openRouterProvider.isConfigured()).thenReturn(true);
        when(openRouterProvider.generateCompletion(anyString(), anyList(), anyString()))
                .thenThrow(new RuntimeException("OpenRouter 401 Unauthorized"));

        when(geminiProvider.isConfigured()).thenReturn(true);
        when(geminiProvider.generateCompletion(anyString(), anyList(), anyString()))
                .thenThrow(new RuntimeException("Gemini quota exceeded"));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                aiGatewayService.generateResponse("System prompt", List.of(), "Summarize sales"));

        assertTrue(ex.getMessage().contains("BizFlow AI Assistant is currently unavailable"));
    }

    @Test
    void testNoProvidersConfigured_ThrowsClearException() {
        when(aiProperties.isEnabled()).thenReturn(true);
        when(openRouterProvider.isConfigured()).thenReturn(false);
        when(geminiProvider.isConfigured()).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                aiGatewayService.generateResponse("System prompt", List.of(), "Summarize sales"));

        assertTrue(ex.getMessage().contains("BizFlow AI Assistant is currently unavailable"));
    }

    @Test
    void testGetAiStatus_WhenOpenRouterConfigured() {
        when(aiProperties.isEnabled()).thenReturn(true);
        when(openRouterProvider.isConfigured()).thenReturn(true);
        when(geminiProvider.isConfigured()).thenReturn(true);

        AiStatusResponse status = aiGatewayService.getAiStatus();

        assertNotNull(status);
        assertTrue(status.isEnabled());
        assertTrue(status.isOpenRouterAvailable());
        assertTrue(status.isGeminiAvailable());
        assertEquals("BizFlow AI", status.getActiveProvider());
        assertEquals(List.of("BizFlow AI"), status.getAvailableProviders());
    }
}
