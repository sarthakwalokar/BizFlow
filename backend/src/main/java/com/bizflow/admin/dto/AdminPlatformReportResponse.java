package com.bizflow.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPlatformReportResponse {
    private long totalTenants;
    private long activeTenants;
    private long inactiveTenants;
    private double activeTenantPercentage;
    private long smallBusinessesCount;
    private long largeBusinessesCount;
    private Map<String, Long> businessTypeDistribution;
    private List<MonthlyRegistrationPoint> registrationTrend;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyRegistrationPoint {
        private String monthLabel;
        private long registrations;
    }
}
