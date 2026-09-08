package com.bizflow.inventory.controller;

import com.bizflow.common.api.ApiResponse;
import com.bizflow.common.api.PageResponse;
import com.bizflow.inventory.PurchaseStatus;
import com.bizflow.inventory.dto.PurchaseRequest;
import com.bizflow.inventory.dto.PurchaseResponse;
import com.bizflow.inventory.service.PurchaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/inventory/purchases")
@RequiredArgsConstructor
@Tag(name = "Inventory Purchases", description = "Purchase Orders and Inward Goods Receipts")
@SecurityRequirement(name = "BearerAuth")
public class PurchaseController {

    private final PurchaseService purchaseService;

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Record a new purchase order / inward goods receipt")
    public ResponseEntity<ApiResponse<PurchaseResponse>> createPurchase(
            @Valid @RequestBody PurchaseRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Purchase recorded successfully", purchaseService.createPurchase(request)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Search purchase orders with filters and pagination")
    public ResponseEntity<ApiResponse<PageResponse<PurchaseResponse>>> searchPurchases(
            @RequestParam(required = false) PurchaseStatus status,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Purchases retrieved",
                purchaseService.searchPurchases(status, supplierId, locationId, startDate, endDate, search, page, size)
        ));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get purchase details by ID")
    public ResponseEntity<ApiResponse<PurchaseResponse>> getPurchaseById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Purchase retrieved", purchaseService.getPurchaseById(id)));
    }

    @PostMapping("/{id}/receive")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Mark ordered purchase as received into stock")
    public ResponseEntity<ApiResponse<PurchaseResponse>> markReceived(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Purchase marked as received", purchaseService.markPurchaseReceived(id)));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Cancel purchase order and reverse stock addition (Owner only)")
    public ResponseEntity<ApiResponse<PurchaseResponse>> cancelPurchase(
            @PathVariable Long id,
            @RequestParam(required = false) String reason
    ) {
        return ResponseEntity.ok(ApiResponse.success("Purchase cancelled", purchaseService.cancelPurchase(id, reason)));
    }
}
