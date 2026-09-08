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
public class SupplierRequest {

    @NotBlank(message = "Supplier name is required")
    @Size(min = 1, max = 150, message = "Supplier name must not exceed 150 characters")
    private String name;

    private String contactPerson;

    private String email;

    private String phone;

    private String address;

    private String taxNumber;

    @Builder.Default
    private Boolean active = true;
}
