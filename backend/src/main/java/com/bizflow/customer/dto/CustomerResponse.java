package com.bizflow.customer.dto;

import com.bizflow.customer.Customer;
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
public class CustomerResponse {

    private Long id;
    private Long businessId;
    private String name;
    private String phone;
    private String email;
    private String address;
    private String notes;
    private BigDecimal totalSpending;
    private Long orderCount;
    private Instant lastPurchaseDate;
    private Instant createdAt;
    private Instant updatedAt;

    public static CustomerResponse fromEntity(Customer customer) {
        if (customer == null) {
            return null;
        }

        return CustomerResponse.builder()
                .id(customer.getId())
                .businessId(customer.getBusinessId())
                .name(customer.getName())
                .phone(customer.getPhone())
                .email(customer.getEmail())
                .address(customer.getAddress())
                .notes(customer.getNotes())
                .totalSpending(BigDecimal.ZERO)
                .orderCount(0L)
                .lastPurchaseDate(null)
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .build();
    }

    public static CustomerResponse fromEntityWithStats(Customer customer, BigDecimal totalSpending, Long orderCount, Instant lastPurchaseDate) {
        if (customer == null) {
            return null;
        }

        return CustomerResponse.builder()
                .id(customer.getId())
                .businessId(customer.getBusinessId())
                .name(customer.getName())
                .phone(customer.getPhone())
                .email(customer.getEmail())
                .address(customer.getAddress())
                .notes(customer.getNotes())
                .totalSpending(totalSpending != null ? totalSpending : BigDecimal.ZERO)
                .orderCount(orderCount != null ? orderCount : 0L)
                .lastPurchaseDate(lastPurchaseDate)
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .build();
    }
}
