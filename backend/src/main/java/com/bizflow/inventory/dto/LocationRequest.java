package com.bizflow.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationRequest {

    @NotBlank(message = "Location name is required")
    @Size(min = 1, max = 150, message = "Location name must not exceed 150 characters")
    private String name;

    private String code;

    private String address;

    private String phone;

    private Boolean primary;

    @Builder.Default
    private Boolean active = true;
}
