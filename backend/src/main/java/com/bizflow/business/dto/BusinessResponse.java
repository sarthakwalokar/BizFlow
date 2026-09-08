package com.bizflow.business.dto;

import com.bizflow.business.Business;
import com.bizflow.business.BusinessSize;
import com.bizflow.business.BusinessType;
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
public class BusinessResponse {
    private Long id;
    private String name;
    private BusinessType businessType;
    private String address;
    private String phone;
    private String email;
    private String logo;
    private String currency;
    private String timezone;
    private BigDecimal taxRate;
    private String taxName;
    private String taxNumber;
    private boolean taxInclusive;
    private BusinessSize businessSize;
    private boolean inventoryEnabled;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;

    public static BusinessResponse fromEntity(Business business) {
        if (business == null) return null;
        return BusinessResponse.builder()
                .id(business.getId())
                .name(business.getName())
                .businessType(business.getBusinessType())
                .address(business.getAddress())
                .phone(business.getPhone())
                .email(business.getEmail())
                .logo(business.getLogo())
                .currency(business.getCurrency())
                .timezone(business.getTimezone())
                .taxRate(business.getTaxRate())
                .taxName(business.getTaxName())
                .taxNumber(business.getTaxNumber())
                .taxInclusive(business.isTaxInclusive())
                .businessSize(business.getBusinessSize() != null ? business.getBusinessSize() : BusinessSize.SMALL)
                .inventoryEnabled(business.isInventoryEnabled())
                .active(business.isActive())
                .createdAt(business.getCreatedAt())
                .updatedAt(business.getUpdatedAt())
                .build();
    }
}
