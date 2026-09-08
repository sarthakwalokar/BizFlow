package com.bizflow.inventory.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockTransferRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Source location ID is required")
    private Long sourceLocationId;

    @NotNull(message = "Target location ID is required")
    private Long targetLocationId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Transfer quantity must be positive")
    private Integer quantity;

    private String notes;
}
