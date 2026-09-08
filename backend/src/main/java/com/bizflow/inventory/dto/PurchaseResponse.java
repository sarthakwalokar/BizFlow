package com.bizflow.inventory.dto;

import com.bizflow.inventory.Purchase;
import com.bizflow.inventory.PurchaseStatus;
import com.bizflow.payment.PaymentMethod;
import com.bizflow.payment.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseResponse {
    private Long id;
    private Long businessId;
    private Long supplierId;
    private String supplierName;
    private Long locationId;
    private String locationName;
    private String purchaseNumber;
    private PurchaseStatus status;
    private BigDecimal totalAmount;
    private PaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
    private LocalDate purchaseDate;
    private String notes;
    private String createdBy;
    private Long createdByUserId;
    private List<PurchaseItemResponse> items;
    private Instant createdAt;
    private Instant updatedAt;

    public static PurchaseResponse fromEntity(Purchase purchase) {
        if (purchase == null) return null;
        List<PurchaseItemResponse> itemResponses = purchase.getItems() != null
                ? purchase.getItems().stream().map(PurchaseItemResponse::fromEntity).collect(Collectors.toList())
                : List.of();

        return PurchaseResponse.builder()
                .id(purchase.getId())
                .businessId(purchase.getBusinessId())
                .supplierId(purchase.getSupplier() != null ? purchase.getSupplier().getId() : null)
                .supplierName(purchase.getSupplier() != null ? purchase.getSupplier().getName() : null)
                .locationId(purchase.getLocation() != null ? purchase.getLocation().getId() : null)
                .locationName(purchase.getLocation() != null ? purchase.getLocation().getName() : null)
                .purchaseNumber(purchase.getPurchaseNumber())
                .status(purchase.getStatus())
                .totalAmount(purchase.getTotalAmount())
                .paymentStatus(purchase.getPaymentStatus())
                .paymentMethod(purchase.getPaymentMethod())
                .purchaseDate(purchase.getPurchaseDate())
                .notes(purchase.getNotes())
                .createdBy(purchase.getCreatedBy())
                .createdByUserId(purchase.getCreatedByUserId())
                .items(itemResponses)
                .createdAt(purchase.getCreatedAt())
                .updatedAt(purchase.getUpdatedAt())
                .build();
    }
}
