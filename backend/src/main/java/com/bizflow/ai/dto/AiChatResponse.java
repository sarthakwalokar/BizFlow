package com.bizflow.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiChatResponse {

    private Long conversationId;
    private String conversationTitle;
    private Long userMessageId;
    private Long assistantMessageId;
    private String reply;
    private String providerUsed;
    private Integer tokensUsed;
    private Instant createdAt;

    @JsonProperty("response")
    public String getResponse() {
        return reply;
    }

    @JsonProperty("provider")
    public String getProvider() {
        return providerUsed;
    }
}
