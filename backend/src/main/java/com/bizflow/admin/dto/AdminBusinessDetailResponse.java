package com.bizflow.admin.dto;

import com.bizflow.business.BusinessType;
import com.bizflow.business.BusinessSize;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminBusinessDetailResponse {
    private Long id;
    private String name;
    private BusinessType businessType;
    private String email;
    private String phone;
    private String address;
    private String logo;
    private String currency;
    private String timezone;
    private BigDecimal taxRate;
    private String taxName;
    private String taxNumber;
    private boolean taxInclusive;
    private String reviewSlug;
    private String publicReviewUrl;
    private boolean reviewEnabled;
    private BusinessSize businessSize;
    private boolean inventoryEnabled;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;

    // Associated Owner Info
    private OwnerSummary owner;

    // Platform Aggregates for Tenant
    private long staffCount;
    private long productCount;
    private long orderCount;
    private long customerCount;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OwnerSummary {
        private Long id;
        private String fullName;
        private String email;
        private String phone;
        private boolean enabled;
        private Instant createdAt;
    }
}
