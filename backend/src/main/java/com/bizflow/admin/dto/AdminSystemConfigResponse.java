package com.bizflow.admin.dto;

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
public class AdminSystemConfigResponse {
    private String platformName;
    private String platformVersion;
    private String environment;
    private boolean maintenanceMode;
    private boolean allowSelfRegistration;
    private String defaultCurrency;
    private String defaultTimezone;
    private int sessionTimeoutMinutes;
    private Instant serverTime;
    private String activeAiProvider;
    private List<String> availableAiProviders;
}
