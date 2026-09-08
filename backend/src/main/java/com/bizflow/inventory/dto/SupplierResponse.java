package com.bizflow.inventory.dto;

import com.bizflow.inventory.Supplier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierResponse {
    private Long id;
    private Long businessId;
    private String name;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
    private String taxNumber;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;

    public static SupplierResponse fromEntity(Supplier supplier) {
        if (supplier == null) return null;
        return SupplierResponse.builder()
                .id(supplier.getId())
                .businessId(supplier.getBusinessId())
                .name(supplier.getName())
                .contactPerson(supplier.getContactPerson())
                .email(supplier.getEmail())
                .phone(supplier.getPhone())
                .address(supplier.getAddress())
                .taxNumber(supplier.getTaxNumber())
                .active(supplier.isActive())
                .createdAt(supplier.getCreatedAt())
                .updatedAt(supplier.getUpdatedAt())
                .build();
    }
}
