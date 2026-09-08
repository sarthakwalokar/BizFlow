package com.bizflow.inventory.controller;

import com.bizflow.common.api.ApiResponse;
import com.bizflow.common.api.PageResponse;
import com.bizflow.inventory.MovementType;
import com.bizflow.inventory.dto.*;
import com.bizflow.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory", description = "Stock Management, Adjustments, Transfers, and Valuation Telemetry")
@SecurityRequirement(name = "BearerAuth")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get inventory valuation and stock health summary")
    public ResponseEntity<ApiResponse<InventorySummaryResponse>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success("Inventory summary retrieved", inventoryService.getInventorySummary()));
    }

    @GetMapping("/stock")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "List catalog stock levels with filtering")
    public ResponseEntity<ApiResponse<PageResponse<StockItemResponse>>> getStockList(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean lowStockOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Stock list retrieved",
                inventoryService.getStockList(search, categoryId, lowStockOnly, page, size)
        ));
    }

    @PostMapping("/adjust")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Quick stock adjustment (+/- delta or new absolute count)")
    public ResponseEntity<ApiResponse<StockItemResponse>> adjustStock(
            @Valid @RequestBody StockAdjustRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Stock adjusted successfully",
                inventoryService.adjustStock(request)
        ));
    }

    @PostMapping("/transfer")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Transfer stock between branches or locations (Large Business)")
    public ResponseEntity<ApiResponse<Void>> transferStock(
            @Valid @RequestBody StockTransferRequest request
    ) {
        inventoryService.transferStock(request);
        return ResponseEntity.ok(ApiResponse.success("Stock transferred successfully", null));
    }

    @GetMapping("/movements")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get stock movements audit trail")
    public ResponseEntity<ApiResponse<PageResponse<StockMovementResponse>>> getStockMovements(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) MovementType movementType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Stock movements retrieved",
                inventoryService.getStockMovements(productId, locationId, movementType, startDate, endDate, page, size)
        ));
    }
}
