package com.bizflow.ai.service;

import com.bizflow.ai.config.AiProperties;
import com.bizflow.ai.dto.AiMessageDto;
import com.bizflow.ai.dto.AiStatusResponse;
import com.bizflow.ai.provider.GeminiProvider;
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
    private GeminiProvider geminiProvider;

    @InjectMocks
    private AIGatewayService aiGatewayService;

    @Test
    void testGeminiCompletion_Success() {
        when(geminiProvider.isConfigured()).thenReturn(true);
        when(geminiProvider.getProviderName()).thenReturn("Google Gemini (gemini-3.8-flash)");
        when(geminiProvider.generateCompletion(anyString(), anyList(), anyString()))
                .thenReturn("Gemini response: Sales are up 15%.");

        AIGatewayService.GenerationResult result = aiGatewayService.generateResponse(
                "System prompt", List.of(), "How were sales?"
        );

        assertNotNull(result);
        assertEquals("Gemini response: Sales are up 15%.", result.reply());
        assertTrue(result.providerUsed().contains("Gemini"));
        verify(geminiProvider, times(1)).generateCompletion(anyString(), anyList(), anyString());
    }

    @Test
    void testGeminiCompletion_WhenNotConfigured_ThrowsIllegalStateException() {
        when(geminiProvider.isConfigured()).thenReturn(false);

        assertThrows(IllegalStateException.class, () -> {
            aiGatewayService.generateResponse("System prompt", List.of(), "Expenses?");
        });
    }

    @Test
    void testGeminiCompletion_WhenGeminiFails_ThrowsRuntimeException() {
        when(geminiProvider.isConfigured()).thenReturn(true);
        when(geminiProvider.getProviderName()).thenReturn("Google Gemini (gemini-3.8-flash)");
        when(geminiProvider.generateCompletion(anyString(), anyList(), anyString()))
                .thenThrow(new RuntimeException("API connection failure"));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            aiGatewayService.generateResponse("System prompt", List.of(), "Top products?");
        });

        assertTrue(ex.getMessage().contains("Gemini generation failed"));
    }

    @Test
    void testGetAiStatus_WhenConfigured() {
        when(aiProperties.isEnabled()).thenReturn(true);
        when(geminiProvider.isConfigured()).thenReturn(true);
        when(geminiProvider.getProviderName()).thenReturn("Google Gemini (gemini-3.8-flash)");

        AiStatusResponse status = aiGatewayService.getAiStatus();

        assertNotNull(status);
        assertTrue(status.isEnabled());
        assertTrue(status.isGeminiAvailable());
        assertFalse(status.isGroqAvailable());
        assertFalse(status.isOpenRouterAvailable());
        assertEquals("Google Gemini (gemini-3.8-flash)", status.getActiveProvider());
    }

    @Test
    void testGetAiStatus_WhenNotConfigured() {
        when(aiProperties.isEnabled()).thenReturn(true);
        when(geminiProvider.isConfigured()).thenReturn(false);

        AiStatusResponse status = aiGatewayService.getAiStatus();

        assertNotNull(status);
        assertTrue(status.isEnabled());
        assertFalse(status.isGeminiAvailable());
        assertEquals("Google Gemini (Key Required)", status.getActiveProvider());
    }
}
