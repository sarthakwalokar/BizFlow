package com.bizflow.inventory.dto;

import com.bizflow.inventory.PurchaseItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseItemResponse {
    private Long id;
    private Long productId;
    private String productNameSnapshot;
    private Integer quantity;
    private BigDecimal unitCost;
    private BigDecimal subtotal;

    public static PurchaseItemResponse fromEntity(PurchaseItem item) {
        if (item == null) return null;
        return PurchaseItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productNameSnapshot(item.getProductNameSnapshot())
                .quantity(item.getQuantity())
                .unitCost(item.getUnitCost())
                .subtotal(item.getSubtotal())
                .build();
    }
}
