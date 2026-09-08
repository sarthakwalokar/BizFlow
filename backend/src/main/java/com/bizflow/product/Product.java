package com.bizflow.product;

import com.bizflow.business.Business;
import com.bizflow.common.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "products")
public class Product extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @NotBlank(message = "Product or service name is required")
    @Size(max = 150, message = "Name must not exceed 150 characters")
    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Product type is required (PHYSICAL or SERVICE)")
    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false, length = 30)
    private ProductType productType;

    @NotNull(message = "Price is required")
    @PositiveOrZero(message = "Price must be greater than or equal to zero")
    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @PositiveOrZero(message = "Cost price must be greater than or equal to zero")
    @Column(name = "cost_price", precision = 12, scale = 2)
    private BigDecimal costPrice;

    @Size(max = 100, message = "SKU must not exceed 100 characters")
    @Column(name = "sku", length = 100)
    private String sku;

    // Inventory & Stock Tracking
    @Builder.Default
    @Column(name = "track_stock", nullable = false)
    private boolean trackStock = false;

    @Builder.Default
    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Builder.Default
    @Column(name = "low_stock_threshold", nullable = false)
    private Integer lowStockThreshold = 5;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    public Long getBusinessId() {
        return business != null ? business.getId() : null;
    }
}
