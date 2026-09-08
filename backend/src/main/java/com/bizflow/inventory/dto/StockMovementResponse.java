package com.bizflow.inventory.dto;

import com.bizflow.inventory.MovementType;
import com.bizflow.inventory.ReferenceType;
import com.bizflow.inventory.StockMovement;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private Long locationId;
    private String locationName;
    private MovementType movementType;
    private Integer quantity;
    private Integer previousStock;
    private Integer newStock;
    private ReferenceType referenceType;
    private Long referenceId;
    private String referenceNumber;
    private String notes;
    private String createdBy;
    private Instant createdAt;

    public static StockMovementResponse fromEntity(StockMovement movement) {
        if (movement == null) return null;
        return StockMovementResponse.builder()
                .id(movement.getId())
                .productId(movement.getProduct() != null ? movement.getProduct().getId() : null)
                .productName(movement.getProduct() != null ? movement.getProduct().getName() : "Unknown Item")
                .productSku(movement.getProduct() != null ? movement.getProduct().getSku() : null)
                .locationId(movement.getLocation() != null ? movement.getLocation().getId() : null)
                .locationName(movement.getLocation() != null ? movement.getLocation().getName() : null)
                .movementType(movement.getMovementType())
                .quantity(movement.getQuantity())
                .previousStock(movement.getPreviousStock())
                .newStock(movement.getNewStock())
                .referenceType(movement.getReferenceType())
                .referenceId(movement.getReferenceId())
                .referenceNumber(movement.getReferenceNumber())
                .notes(movement.getNotes())
                .createdBy(movement.getCreatedBy())
                .createdAt(movement.getCreatedAt())
                .build();
    }
}
