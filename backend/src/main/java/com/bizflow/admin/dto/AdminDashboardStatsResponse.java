package com.bizflow.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStatsResponse {
    private long totalBusinesses;
    private long activeBusinesses;
    private long inactiveBusinesses;
    private long totalUsers;
    private long totalOwners;
    private long totalStaff;
    private long totalProducts;
    private long totalOrders;
    private Map<String, Long> businessTypeDistribution;
    private Map<String, Long> businessSizeDistribution;
    private List<AdminActivityItem> recentActivity;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminActivityItem {
        private String id;
        private String type; // TENANT_REGISTERED, USER_CREATED, TENANT_STATUS_CHANGED
        private String title;
        private String description;
        private String businessName;
        private Instant timestamp;
    }
}
