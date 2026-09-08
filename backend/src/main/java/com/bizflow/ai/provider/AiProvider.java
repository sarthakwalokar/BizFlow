package com.bizflow.ai.provider;

import com.bizflow.ai.dto.AiMessageDto;

import java.util.List;

public interface AiProvider {

    String getProviderName();

    boolean isConfigured();

    String generateCompletion(String systemPrompt, List<AiMessageDto> history, String userPrompt);
}
