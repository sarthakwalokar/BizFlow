package com.bizflow.billing.controller;

import com.bizflow.billing.OrderStatus;
import com.bizflow.billing.dto.*;
import com.bizflow.billing.service.BillingService;
import com.bizflow.common.api.ApiResponse;
import com.bizflow.common.api.PageResponse;
import com.bizflow.payment.PaymentMethod;
import com.bizflow.payment.PaymentStatus;
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
@RequestMapping({"/api/v1/billing", "/api/billing", "/api/v1/sales", "/api/sales"})
@RequiredArgsConstructor
@Tag(name = "Billing & Sales", description = "POS Checkout, Invoicing, and Sales Telemetry APIs")
@SecurityRequirement(name = "bearerAuth")
public class BillingController {

    private final BillingService billingService;

    @PostMapping({"", "/orders", "/checkout"})
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Create and checkout an order/bill with tax and payments")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponse response = billingService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Order processed and bill created successfully", response));
    }

    @GetMapping({"", "/orders"})
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get paginated orders and bills with multi-criteria search")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getOrders(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(required = false) OrderStatus orderStatus,
            @RequestParam(required = false) PaymentMethod paymentMethod,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        PageResponse<OrderResponse> response = billingService.getOrders(
                search, paymentStatus, orderStatus, paymentMethod, startDate, endDate, page, size, sort);
        return ResponseEntity.ok(ApiResponse.ok("Orders retrieved successfully", response));
    }

    @GetMapping({"/{id}", "/orders/{id}"})
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get full order/bill details by ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long id) {
        OrderResponse response = billingService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.ok("Order details retrieved", response));
    }

    @PostMapping({"/{id}/cancel", "/orders/{id}/cancel"})
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Cancel / void an order and its associated payments")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable Long id,
            @RequestBody(required = false) CancelOrderRequest request) {
        OrderResponse response = billingService.cancelOrder(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Order successfully cancelled/voided", response));
    }

    @GetMapping({"/summary", "/dashboard/summary"})
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get live sales telemetry summary for dashboard")
    public ResponseEntity<ApiResponse<BillingSummaryResponse>> getDashboardSummary() {
        BillingSummaryResponse response = billingService.getDashboardSummary();
        return ResponseEntity.ok(ApiResponse.ok("Billing dashboard summary retrieved", response));
    }
}
