package com.bizflow.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiStatusResponse {
    private boolean enabled;
    private String activeProvider;
    private List<String> availableProviders;
    private boolean geminiAvailable;
    private boolean groqAvailable;
    private boolean openRouterAvailable;
    private boolean fallbackAvailable;
}
