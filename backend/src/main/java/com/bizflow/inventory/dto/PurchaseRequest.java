package com.bizflow.inventory.dto;

import com.bizflow.inventory.PurchaseStatus;
import com.bizflow.payment.PaymentMethod;
import com.bizflow.payment.PaymentStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseRequest {

    private Long supplierId;

    private Long locationId;

    @NotNull(message = "Purchase date is required")
    private LocalDate purchaseDate;

    @Builder.Default
    private PurchaseStatus status = PurchaseStatus.RECEIVED;

    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.COMPLETED;

    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.CASH;

    private String notes;

    @Valid
    @NotEmpty(message = "Purchase must contain at least one item")
    private List<PurchaseItemRequest> items;
}
