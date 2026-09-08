package com.bizflow.inventory.dto;

import com.bizflow.inventory.Location;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationResponse {
    private Long id;
    private Long businessId;
    private String name;
    private String code;
    private String address;
    private String phone;
    private boolean primary;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;

    public static LocationResponse fromEntity(Location location) {
        if (location == null) return null;
        return LocationResponse.builder()
                .id(location.getId())
                .businessId(location.getBusinessId())
                .name(location.getName())
                .code(location.getCode())
                .address(location.getAddress())
                .phone(location.getPhone())
                .primary(location.isPrimary())
                .active(location.isActive())
                .createdAt(location.getCreatedAt())
                .updatedAt(location.getUpdatedAt())
                .build();
    }
}
