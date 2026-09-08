package com.bizflow.inventory.dto;

import com.bizflow.product.Product;
import com.bizflow.product.ProductType;
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
public class StockItemResponse {
    private Long productId;
    private String productName;
    private String sku;
    private String categoryName;
    private ProductType productType;
    private BigDecimal price;
    private BigDecimal costPrice;
    private boolean trackStock;
    private Integer stockQuantity;
    private Integer lowStockThreshold;
    private boolean lowStock;
    private boolean outOfStock;
    private List<LocationStockItem> locationStocks;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LocationStockItem {
        private Long locationId;
        private String locationName;
        private String locationCode;
        private Integer quantity;
        private Integer lowStockThreshold;
    }

    public static StockItemResponse fromProduct(Product product, List<LocationStockItem> locationStocks) {
        int qty = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        int threshold = product.getLowStockThreshold() != null ? product.getLowStockThreshold() : 5;
        boolean isTracked = product.isTrackStock();

        return StockItemResponse.builder()
                .productId(product.getId())
                .productName(product.getName())
                .sku(product.getSku())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .productType(product.getProductType())
                .price(product.getPrice())
                .costPrice(product.getCostPrice())
                .trackStock(isTracked)
                .stockQuantity(qty)
                .lowStockThreshold(threshold)
                .lowStock(isTracked && qty <= threshold && qty > 0)
                .outOfStock(isTracked && qty <= 0)
                .locationStocks(locationStocks)
                .build();
    }
}
