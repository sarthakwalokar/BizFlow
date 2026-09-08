package com.bizflow.customer.dto;

import com.bizflow.billing.dto.OrderResponse;
import com.bizflow.customer.Customer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerProfileResponse {

    private Long id;
    private Long businessId;
    private String name;
    private String phone;
    private String email;
    private String address;
    private String notes;
    private BigDecimal totalSpending;
    private Long orderCount;
    private BigDecimal averageOrderValue;
    private Instant firstPurchaseDate;
    private Instant lastPurchaseDate;
    private Instant createdAt;
    private Instant updatedAt;
    @Builder.Default
    private List<OrderResponse> purchaseHistory = new ArrayList<>();

    public static CustomerProfileResponse fromEntity(
            Customer customer,
            BigDecimal totalSpending,
            Long orderCount,
            Instant firstPurchaseDate,
            Instant lastPurchaseDate,
            List<OrderResponse> purchaseHistory) {
        if (customer == null) {
            return null;
        }

        BigDecimal spending = totalSpending != null ? totalSpending : BigDecimal.ZERO;
        long count = orderCount != null ? orderCount : 0L;
        BigDecimal aov = count > 0 
                ? spending.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP) 
                : BigDecimal.ZERO;

        return CustomerProfileResponse.builder()
                .id(customer.getId())
                .businessId(customer.getBusinessId())
                .name(customer.getName())
                .phone(customer.getPhone())
                .email(customer.getEmail())
                .address(customer.getAddress())
                .notes(customer.getNotes())
                .totalSpending(spending)
                .orderCount(count)
                .averageOrderValue(aov)
                .firstPurchaseDate(firstPurchaseDate)
                .lastPurchaseDate(lastPurchaseDate)
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .purchaseHistory(purchaseHistory != null ? purchaseHistory : new ArrayList<>())
                .build();
    }
}
