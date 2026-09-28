package com.bizflow.admin.dto;

import com.bizflow.business.BusinessType;
import com.bizflow.user.Role;
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
    private long activeUsers;
    private long inactiveUsers;
    private long totalOwners;
    private long totalStaff;
    private long totalAdmins;
    private long totalProducts;
    private long totalOrders;

    // Registration Velocity
    private long newUsersToday;
    private long newUsers7d;
    private long newUsers30d;
    private long newBusinessesToday;
    private long newBusinesses7d;
    private long newBusinesses30d;

    private Map<String, Long> businessTypeDistribution;
    private Map<String, Long> businessSizeDistribution;
    private List<MonthlyGrowthPoint> monthlyGrowth;
    private List<RecentUserItem> recentUsers;
    private List<RecentBusinessItem> recentBusinesses;
    private List<AdminActivityItem> recentActivity;
    private List<AdminAlertItem> systemAlerts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminActivityItem {
        private String id;
        private String type; // TENANT_REGISTERED, USER_CREATED, TENANT_UPDATED, USER_UPDATED, SYSTEM_EVENT
        private String title;
        private String description;
        private String businessName;
        private String actor;
        private Instant timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentUserItem {
        private Long id;
        private String fullName;
        private String email;
        private String phone;
        private Role role;
        private Long businessId;
        private String businessName;
        private boolean enabled;
        private Instant createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentBusinessItem {
        private Long id;
        private String name;
        private BusinessType businessType;
        private String ownerName;
        private String email;
        private String phone;
        private boolean active;
        private Instant createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminAlertItem {
        private String id;
        private String level; // INFO, WARNING, SUCCESS, ERROR
        private String title;
        private String message;
        private Instant timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyGrowthPoint {
        private String monthLabel;
        private long newBusinesses;
        private long newUsers;
    }
}

