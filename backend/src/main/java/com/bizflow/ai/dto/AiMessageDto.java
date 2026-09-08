package com.bizflow.ai.dto;

import com.bizflow.ai.entity.AiRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiMessageDto {
    private Long id;
    private AiRole role;
    private String content;
    private String providerUsed;
    private Integer tokensUsed;
    private Instant createdAt;
}
