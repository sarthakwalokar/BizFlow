package com.bizflow.ai.service;

import com.bizflow.ai.config.AiProperties;
import com.bizflow.ai.dto.AiMessageDto;
import com.bizflow.ai.dto.AiStatusResponse;
import com.bizflow.ai.provider.DeterministicAdvisorProvider;
import com.bizflow.ai.provider.GeminiProvider;
import com.bizflow.ai.provider.GroqProvider;
import com.bizflow.ai.provider.OpenRouterProvider;
import org.junit.jupiter.api.BeforeEach;
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

    @Mock
    private GroqProvider groqProvider;

    @Mock
    private OpenRouterProvider openRouterProvider;

    @Mock
    private DeterministicAdvisorProvider deterministicAdvisorProvider;

    @InjectMocks
    private AIGatewayService aiGatewayService;

    @BeforeEach
    void setUp() {
        when(aiProperties.isEnabled()).thenReturn(true);
    }

    @Test
    void testPriority1_GeminiSuccess() {
        when(geminiProvider.isConfigured()).thenReturn(true);
        when(geminiProvider.getProviderName()).thenReturn("Google Gemini (gemini-1.5-flash)");
        when(geminiProvider.generateCompletion(anyString(), anyList(), anyString()))
                .thenReturn("Gemini response: Sales are up 15%.");

        AIGatewayService.GenerationResult result = aiGatewayService.generateResponse(
                "System prompt", List.of(), "How were sales?"
        );

        assertNotNull(result);
        assertEquals("Gemini response: Sales are up 15%.", result.reply());
        assertTrue(result.providerUsed().contains("Gemini"));
        verify(groqProvider, never()).generateCompletion(any(), any(), any());
    }

    @Test
    void testPriority2_GroqFallbackWhenGeminiFails() {
        when(geminiProvider.isConfigured()).thenReturn(true);
        when(geminiProvider.getProviderName()).thenReturn("Google Gemini");
        when(geminiProvider.generateCompletion(anyString(), anyList(), anyString()))
                .thenThrow(new RuntimeException("Gemini quota exceeded"));

        when(groqProvider.isConfigured()).thenReturn(true);
        when(groqProvider.getProviderName()).thenReturn("Groq (llama-3.3-70b)");
        when(groqProvider.generateCompletion(anyString(), anyList(), anyString()))
                .thenReturn("Groq response: Top product is Espresso.");

        AIGatewayService.GenerationResult result = aiGatewayService.generateResponse(
                "System prompt", List.of(), "Top products?"
        );

        assertNotNull(result);
        assertEquals("Groq response: Top product is Espresso.", result.reply());
        assertTrue(result.providerUsed().contains("Groq"));
    }

    @Test
    void testPriority3_OpenRouterFallbackWhenGeminiAndGroqFail() {
        when(geminiProvider.isConfigured()).thenReturn(false);
        when(groqProvider.isConfigured()).thenReturn(true);
        when(groqProvider.getProviderName()).thenReturn("Groq");
        when(groqProvider.generateCompletion(anyString(), anyList(), anyString()))
                .thenThrow(new RuntimeException("Groq connection timeout"));

        when(openRouterProvider.isConfigured()).thenReturn(true);
        when(openRouterProvider.getProviderName()).thenReturn("OpenRouter");
        when(openRouterProvider.generateCompletion(anyString(), anyList(), anyString()))
                .thenReturn("OpenRouter response: Restock 5 units of Milk.");

        AIGatewayService.GenerationResult result = aiGatewayService.generateResponse(
                "System prompt", List.of(), "Restock list?"
        );

        assertNotNull(result);
        assertEquals("OpenRouter response: Restock 5 units of Milk.", result.reply());
        assertTrue(result.providerUsed().contains("OpenRouter"));
    }

    @Test
    void testDeterministicFallback_WhenNoProvidersConfigured() {
        when(geminiProvider.isConfigured()).thenReturn(false);
        when(groqProvider.isConfigured()).thenReturn(false);
        when(openRouterProvider.isConfigured()).thenReturn(false);
        when(deterministicAdvisorProvider.getProviderName()).thenReturn("BizFlow Intelligent Advisor");
        when(deterministicAdvisorProvider.generateCompletion(any(), any(), any()))
                .thenReturn("Local advice: Review your top 3 expenses.");

        AIGatewayService.GenerationResult result = aiGatewayService.generateResponse(
                "System prompt", List.of(), "Expenses?"
        );

        assertNotNull(result);
        assertEquals("Local advice: Review your top 3 expenses.", result.reply());
        assertEquals("BizFlow Intelligent Advisor", result.providerUsed());
    }

    @Test
    void testGetAiStatus() {
        when(geminiProvider.isConfigured()).thenReturn(true);
        when(geminiProvider.getProviderName()).thenReturn("Google Gemini");
        when(groqProvider.isConfigured()).thenReturn(false);
        when(openRouterProvider.isConfigured()).thenReturn(false);

        AiStatusResponse status = aiGatewayService.getAiStatus();

        assertNotNull(status);
        assertTrue(status.isEnabled());
        assertTrue(status.isGeminiAvailable());
        assertFalse(status.isGroqAvailable());
        assertFalse(status.isOpenRouterAvailable());
        assertTrue(status.isFallbackAvailable());
        assertEquals("Google Gemini", status.getActiveProvider());
    }
}
