package com.bizflow.product.dto;

import com.bizflow.product.Product;
import com.bizflow.product.ProductType;
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
public class ProductResponse {
    private Long id;
    private Long businessId;
    private String name;
    private String description;
    private CategoryResponse category;
    private ProductType productType;
    private BigDecimal price;
    private BigDecimal costPrice;
    private String sku;
    private boolean trackStock;
    private Integer stockQuantity;
    private Integer lowStockThreshold;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;

    public static ProductResponse fromEntity(Product product) {
        if (product == null) return null;
        return ProductResponse.builder()
                .id(product.getId())
                .businessId(product.getBusinessId())
                .name(product.getName())
                .description(product.getDescription())
                .category(CategoryResponse.fromEntity(product.getCategory()))
                .productType(product.getProductType())
                .price(product.getPrice())
                .costPrice(product.getCostPrice())
                .sku(product.getSku())
                .trackStock(product.isTrackStock())
                .stockQuantity(product.getStockQuantity() != null ? product.getStockQuantity() : 0)
                .lowStockThreshold(product.getLowStockThreshold() != null ? product.getLowStockThreshold() : 5)
                .active(product.isActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
