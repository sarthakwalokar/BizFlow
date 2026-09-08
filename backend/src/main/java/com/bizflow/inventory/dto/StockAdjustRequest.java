package com.bizflow.inventory.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockAdjustRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    private Long locationId;

    /**
     * Signed delta to adjust (e.g. +10 or -5). If newStockQuantity is set, this is ignored.
     */
    private Integer adjustmentQuantity;

    /**
     * Absolute new stock level to set (e.g. 25).
     */
    private Integer newStockQuantity;

    private String notes;
}
