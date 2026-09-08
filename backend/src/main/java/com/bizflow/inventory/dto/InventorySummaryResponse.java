package com.bizflow.inventory.dto;

import com.bizflow.business.BusinessSize;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventorySummaryResponse {
    private BusinessSize businessSize;
    private boolean inventoryEnabled;
    private long totalTrackedProducts;
    private long inStockProducts;
    private long lowStockProducts;
    private long outOfStockProducts;
    private BigDecimal totalInventoryValuation; // based on costPrice
    private BigDecimal totalRetailValuation; // based on selling price
    private long totalLocationsCount;
    private long totalSuppliersCount;
    private long totalPurchasesCount;
    private BigDecimal totalPurchaseSpend;
    private String currency;
    private List<StockMovementResponse> recentMovements;
}
