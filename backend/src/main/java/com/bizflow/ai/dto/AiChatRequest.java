package com.bizflow.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiChatRequest {

    private Long conversationId;

    @NotBlank(message = "Message prompt cannot be blank")
    @Size(max = 2000, message = "Message must not exceed 2000 characters")
    private String message;
}
