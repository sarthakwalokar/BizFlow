package com.bizflow.ai.service;

import com.bizflow.ai.dto.*;
import com.bizflow.ai.entity.AiConversation;
import com.bizflow.ai.entity.AiMessage;
import com.bizflow.ai.entity.AiRole;
import com.bizflow.ai.repository.AiConversationRepository;
import com.bizflow.ai.repository.AiMessageRepository;
import com.bizflow.business.Business;
import com.bizflow.business.BusinessRepository;
import com.bizflow.common.exception.ResourceNotFoundException;
import com.bizflow.security.SecurityUtils;
import com.bizflow.user.User;
import com.bizflow.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiConversationService {

    private final AiConversationRepository conversationRepository;
    private final AiMessageRepository messageRepository;
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final AIBusinessContextService businessContextService;
    private final AIGatewayService aiGatewayService;

    @Transactional
    public AiChatResponse processChatMessage(AiChatRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Long userId = SecurityUtils.getCurrentUserId();

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", "id", businessId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // 1. Resolve or Create Conversation
        AiConversation conversation;
        boolean isNewConversation = false;

        if (request.getConversationId() != null) {
            conversation = conversationRepository.findByIdAndBusinessIdAndUserId(request.getConversationId(), businessId, userId)
                    .orElseThrow(() -> new ResourceNotFoundException("AiConversation", "id", request.getConversationId()));
        } else {
            isNewConversation = true;
            String generatedTitle = generateTitleFromPrompt(request.getMessage());
            conversation = AiConversation.builder()
                    .business(business)
                    .user(user)
                    .title(generatedTitle)
                    .build();
            conversation = conversationRepository.save(conversation);
        }

        // 2. Fetch existing message history for conversational context
        List<AiMessage> pastMessages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());
        List<AiMessageDto> historyDto = pastMessages.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        // 3. Save current user message
        AiMessage userMessage = AiMessage.builder()
                .conversation(conversation)
                .role(AiRole.USER)
                .content(request.getMessage())
                .build();
        userMessage = messageRepository.save(userMessage);

        // 4. Build Real-time Grounded Business Context
        String systemPrompt = businessContextService.buildSystemPromptForBusiness(businessId);

        // 5. Query AI Gateway with Fallback Chain
        AIGatewayService.GenerationResult result = aiGatewayService.generateResponse(
                systemPrompt,
                historyDto,
                request.getMessage()
        );

        // 6. Save assistant message
        AiMessage assistantMessage = AiMessage.builder()
                .conversation(conversation)
                .role(AiRole.ASSISTANT)
                .content(result.reply())
                .providerUsed(result.providerUsed())
                .tokensUsed(result.tokensUsed())
                .build();
        assistantMessage = messageRepository.save(assistantMessage);

        // Update conversation timestamp
        conversationRepository.save(conversation);

        return AiChatResponse.builder()
                .conversationId(conversation.getId())
                .conversationTitle(conversation.getTitle())
                .userMessageId(userMessage.getId())
                .assistantMessageId(assistantMessage.getId())
                .reply(assistantMessage.getContent())
                .providerUsed(assistantMessage.getProviderUsed())
                .tokensUsed(assistantMessage.getTokensUsed())
                .createdAt(assistantMessage.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<AiConversationSummaryResponse> listUserConversations() {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Long userId = SecurityUtils.getCurrentUserId();

        List<AiConversation> conversations = conversationRepository.findByBusinessIdAndUserIdOrderByUpdatedAtDesc(businessId, userId);

        return conversations.stream().map(conv -> {
            List<AiMessage> msgs = messageRepository.findByConversationIdOrderByCreatedAtAsc(conv.getId());
            String lastPreview = msgs.isEmpty() ? "" : msgs.get(msgs.size() - 1).getContent();
            if (lastPreview.length() > 80) {
                lastPreview = lastPreview.substring(0, 80) + "...";
            }

            return AiConversationSummaryResponse.builder()
                    .id(conv.getId())
                    .title(conv.getTitle())
                    .messageCount(msgs.size())
                    .lastMessagePreview(lastPreview)
                    .createdAt(conv.getCreatedAt())
                    .updatedAt(conv.getUpdatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AiConversationDetailResponse getConversationDetail(Long conversationId) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Long userId = SecurityUtils.getCurrentUserId();

        AiConversation conv = conversationRepository.findByIdAndBusinessIdAndUserId(conversationId, businessId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("AiConversation", "id", conversationId));

        List<AiMessage> msgs = messageRepository.findByConversationIdOrderByCreatedAtAsc(conv.getId());
        List<AiMessageDto> msgDtos = msgs.stream().map(this::mapToDto).collect(Collectors.toList());

        return AiConversationDetailResponse.builder()
                .id(conv.getId())
                .title(conv.getTitle())
                .messages(msgDtos)
                .createdAt(conv.getCreatedAt())
                .updatedAt(conv.getUpdatedAt())
                .build();
    }

    @Transactional
    public void deleteConversation(Long conversationId) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Long userId = SecurityUtils.getCurrentUserId();

        AiConversation conv = conversationRepository.findByIdAndBusinessIdAndUserId(conversationId, businessId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("AiConversation", "id", conversationId));

        conversationRepository.delete(conv);
    }

    @Transactional(readOnly = true)
    public List<AiSuggestedQuestion> getSuggestedQuestions() {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        return businessContextService.generateSuggestions(businessId);
    }

    private AiMessageDto mapToDto(AiMessage msg) {
        return AiMessageDto.builder()
                .id(msg.getId())
                .role(msg.getRole())
                .content(msg.getContent())
                .providerUsed(msg.getProviderUsed())
                .tokensUsed(msg.getTokensUsed())
                .createdAt(msg.getCreatedAt())
                .build();
    }

    private String generateTitleFromPrompt(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            return "Business Inquiry";
        }
        String clean = prompt.trim().replace("\n", " ");
        if (clean.length() > 40) {
            return clean.substring(0, 40) + "...";
        }
        return clean;
    }
}
