package com.bizflow.product.dto;

import com.bizflow.product.ProductType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class ProductRequest {

    @NotBlank(message = "Product or service name is required")
    @Size(min = 1, max = 150, message = "Name must be between 1 and 150 characters")
    private String name;

    private String description;

    private Long categoryId;

    @NotNull(message = "Product type is required (PHYSICAL or SERVICE)")
    private ProductType productType;

    @NotNull(message = "Price is required")
    @PositiveOrZero(message = "Price must be greater than or equal to zero")
    private BigDecimal price;

    @PositiveOrZero(message = "Cost price must be greater than or equal to zero")
    private BigDecimal costPrice;

    @Size(max = 100, message = "SKU must not exceed 100 characters")
    private String sku;

    private Boolean trackStock;

    private Integer stockQuantity;

    private Integer lowStockThreshold;

    @Builder.Default
    private Boolean active = true;
}
