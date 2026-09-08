package com.bizflow.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminSystemConfigRequest {
    private Boolean maintenanceMode;
    private Boolean allowSelfRegistration;
    private String defaultCurrency;
    private String defaultTimezone;
    private Integer sessionTimeoutMinutes;
}
