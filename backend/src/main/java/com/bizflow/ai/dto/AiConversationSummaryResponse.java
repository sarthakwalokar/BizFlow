package com.bizflow.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiConversationSummaryResponse {
    private Long id;
    private String title;
    private int messageCount;
    private String lastMessagePreview;
    private Instant createdAt;
    private Instant updatedAt;
}
