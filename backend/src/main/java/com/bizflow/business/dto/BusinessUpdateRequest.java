package com.bizflow.business.dto;

import com.bizflow.business.BusinessSize;
import com.bizflow.business.BusinessType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessUpdateRequest {

    @NotBlank(message = "Business name cannot be empty")
    @Size(min = 2, max = 150, message = "Business name must be between 2 and 150 characters")
    private String name;

    private BusinessType businessType;

    private String address;

    private String phone;

    private String email;

    private String logo;

    private String currency;

    private String timezone;

    @PositiveOrZero(message = "Tax rate cannot be negative")
    private BigDecimal taxRate;

    private String taxName;

    private String taxNumber;

    private Boolean taxInclusive;

    private BusinessSize businessSize;

    private Boolean inventoryEnabled;
}
