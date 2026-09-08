package com.bizflow.ai.controller;

import com.bizflow.ai.dto.*;
import com.bizflow.ai.service.AIGatewayService;
import com.bizflow.ai.service.AiConversationService;
import com.bizflow.common.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/ai", "/api/ai"})
@RequiredArgsConstructor
@Tag(name = "AI Business Assistant", description = "AI-powered business intelligence, predictions, and conversational analysis")
public class AiController {

    private final AiConversationService conversationService;
    private final AIGatewayService aiGatewayService;

    @PostMapping("/chat")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF', 'ADMIN')")
    @Operation(summary = "Send a message to the AI Business Assistant", description = "Executes an analytical business inquiry with grounded real-time data")
    public ResponseEntity<ApiResponse<AiChatResponse>> chat(@Valid @RequestBody AiChatRequest request) {
        AiChatResponse response = conversationService.processChatMessage(request);
        return ResponseEntity.ok(ApiResponse.ok("AI analysis completed successfully", response));
    }

    @GetMapping("/conversations")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF', 'ADMIN')")
    @Operation(summary = "List user conversations", description = "Retrieves all past AI conversation summaries for the current user and business")
    public ResponseEntity<ApiResponse<List<AiConversationSummaryResponse>>> listConversations() {
        List<AiConversationSummaryResponse> conversations = conversationService.listUserConversations();
        return ResponseEntity.ok(ApiResponse.ok(conversations));
    }

    @GetMapping("/conversations/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF', 'ADMIN')")
    @Operation(summary = "Get conversation details", description = "Retrieves full message history for a specific conversation")
    public ResponseEntity<ApiResponse<AiConversationDetailResponse>> getConversation(@PathVariable("id") Long id) {
        AiConversationDetailResponse conversation = conversationService.getConversationDetail(id);
        return ResponseEntity.ok(ApiResponse.ok(conversation));
    }

    @DeleteMapping("/conversations/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF', 'ADMIN')")
    @Operation(summary = "Delete conversation", description = "Permanently deletes a conversation and its messages")
    public ResponseEntity<ApiResponse<Void>> deleteConversation(@PathVariable("id") Long id) {
        conversationService.deleteConversation(id);
        return ResponseEntity.ok(ApiResponse.ok("Conversation deleted successfully", null));
    }

    @GetMapping("/suggestions")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF', 'ADMIN')")
    @Operation(summary = "Get suggested questions", description = "Generates dynamic context-aware suggested prompts based on current business metrics")
    public ResponseEntity<ApiResponse<List<AiSuggestedQuestion>>> getSuggestions() {
        List<AiSuggestedQuestion> suggestions = conversationService.getSuggestedQuestions();
        return ResponseEntity.ok(ApiResponse.ok(suggestions));
    }

    @GetMapping("/status")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF', 'ADMIN')")
    @Operation(summary = "Get AI provider status", description = "Returns active provider information without exposing secret API keys")
    public ResponseEntity<ApiResponse<AiStatusResponse>> getStatus() {
        AiStatusResponse status = aiGatewayService.getAiStatus();
        return ResponseEntity.ok(ApiResponse.ok(status));
    }
}
