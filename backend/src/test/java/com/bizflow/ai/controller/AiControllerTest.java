package com.bizflow.ai.controller;

import com.bizflow.ai.dto.*;
import com.bizflow.ai.entity.AiRole;
import com.bizflow.ai.service.AIGatewayService;
import com.bizflow.ai.service.AiConversationService;
import com.bizflow.security.JwtAuthenticationEntryPoint;
import com.bizflow.security.JwtAuthenticationFilter;
import com.bizflow.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AiController.class)
@AutoConfigureMockMvc(addFilters = false)
class AiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AiConversationService conversationService;

    @MockBean
    private AIGatewayService aiGatewayService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @WithMockUser(roles = "OWNER")
    void testChatEndpoint() throws Exception {
        AiChatRequest request = AiChatRequest.builder()
                .message("How were my sales this month?")
                .build();

        AiChatResponse response = AiChatResponse.builder()
                .conversationId(1L)
                .conversationTitle("How were my sales this month?")
                .userMessageId(10L)
                .assistantMessageId(11L)
                .reply("### Monthly Sales\nYour gross revenue is $12,450 across 128 orders.")
                .providerUsed("Google Gemini (gemini-1.5-flash)")
                .tokensUsed(420)
                .createdAt(Instant.now())
                .build();

        when(conversationService.processChatMessage(any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.conversationId").value(1))
                .andExpect(jsonPath("$.data.reply").isNotEmpty())
                .andExpect(jsonPath("$.data.providerUsed").value("Google Gemini (gemini-1.5-flash)"));
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void testListConversations() throws Exception {
        AiConversationSummaryResponse summary = AiConversationSummaryResponse.builder()
                .id(1L)
                .title("Inventory Restock Inquiry")
                .messageCount(4)
                .lastMessagePreview("Order 15 units of Arabica beans.")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        when(conversationService.listUserConversations()).thenReturn(List.of(summary));

        mockMvc.perform(get("/api/v1/ai/conversations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].title").value("Inventory Restock Inquiry"));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void testGetConversationDetail() throws Exception {
        AiMessageDto msg = AiMessageDto.builder()
                .id(10L)
                .role(AiRole.USER)
                .content("What are my top expenses?")
                .createdAt(Instant.now())
                .build();

        AiConversationDetailResponse detail = AiConversationDetailResponse.builder()
                .id(1L)
                .title("Expense Inquiry")
                .messages(List.of(msg))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        when(conversationService.getConversationDetail(1L)).thenReturn(detail);

        mockMvc.perform(get("/api/v1/ai/conversations/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.messages[0].content").value("What are my top expenses?"));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void testDeleteConversation() throws Exception {
        doNothing().when(conversationService).deleteConversation(1L);

        mockMvc.perform(delete("/api/v1/ai/conversations/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(conversationService, times(1)).deleteConversation(1L);
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void testGetSuggestions() throws Exception {
        AiSuggestedQuestion q = AiSuggestedQuestion.builder()
                .id("restock-alert")
                .category("INVENTORY")
                .question("Which 3 products need to be restocked?")
                .description("Audit items below threshold")
                .iconName("AlertTriangle")
                .urgent(true)
                .build();

        when(conversationService.getSuggestedQuestions()).thenReturn(List.of(q));

        mockMvc.perform(get("/api/v1/ai/suggestions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value("restock-alert"))
                .andExpect(jsonPath("$.data[0].urgent").value(true));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void testGetStatus() throws Exception {
        AiStatusResponse status = AiStatusResponse.builder()
                .enabled(true)
                .activeProvider("Google Gemini")
                .availableProviders(List.of("Gemini", "Deterministic Engine"))
                .geminiAvailable(true)
                .groqAvailable(false)
                .openRouterAvailable(false)
                .fallbackAvailable(true)
                .build();

        when(aiGatewayService.getAiStatus()).thenReturn(status);

        mockMvc.perform(get("/api/v1/ai/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.activeProvider").value("Google Gemini"))
                .andExpect(jsonPath("$.data.geminiAvailable").value(true));
    }
}
