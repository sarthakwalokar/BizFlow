package com.bizflow.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiConversationDetailResponse {
    private Long id;
    private String title;
    private List<AiMessageDto> messages;
    private Instant createdAt;
    private Instant updatedAt;
}
