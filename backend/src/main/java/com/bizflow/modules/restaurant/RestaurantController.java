package com.bizflow.modules.restaurant;

import com.bizflow.common.api.ApiResponse;
import com.bizflow.modules.restaurant.RestaurantDtos.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/restaurant")
@RequiredArgsConstructor
@Tag(name = "Restaurant Module", description = "Tables, Orders, KOT and Dine-in Billing APIs")
@SecurityRequirement(name = "bearerAuth")
public class RestaurantController {

    private final RestaurantService restaurantService;

    @GetMapping("/tables")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get all restaurant tables with active orders")
    public ResponseEntity<ApiResponse<List<TableResponse>>> getTables() {
        return ResponseEntity.ok(ApiResponse.ok("Tables retrieved", restaurantService.getTables()));
    }

    @PostMapping("/tables")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Create a restaurant table")
    public ResponseEntity<ApiResponse<TableResponse>> createTable(@RequestBody TableRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Table created", restaurantService.createTable(request)));
    }

    @PutMapping("/tables/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Update a restaurant table")
    public ResponseEntity<ApiResponse<TableResponse>> updateTable(@PathVariable Long id, @RequestBody TableRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Table updated", restaurantService.updateTable(id, request)));
    }

    @DeleteMapping("/tables/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Delete a restaurant table")
    public ResponseEntity<ApiResponse<Void>> deleteTable(@PathVariable Long id) {
        restaurantService.deleteTable(id);
        return ResponseEntity.ok(ApiResponse.ok("Table deleted", null));
    }

    @GetMapping("/orders")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get restaurant orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrders(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.ok("Orders retrieved", restaurantService.getOrders(status)));
    }

    @PostMapping("/orders")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Create a restaurant order (Dine-in / Takeaway)")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Order created", restaurantService.createOrder(request)));
    }

    @PutMapping("/orders/{id}/status")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Update restaurant order status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(@PathVariable Long id, @RequestBody UpdateStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Order status updated", restaurantService.updateOrderStatus(id, request.getStatus())));
    }

    @GetMapping("/kot")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get Kitchen Order Tickets (KOT)")
    public ResponseEntity<ApiResponse<List<KotTicketResponse>>> getKotTickets() {
        return ResponseEntity.ok(ApiResponse.ok("KOT tickets retrieved", restaurantService.getKotTickets()));
    }

    @PutMapping("/kot/{id}/status")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Update KOT status")
    public ResponseEntity<ApiResponse<KotTicketResponse>> updateKotStatus(@PathVariable Long id, @RequestBody UpdateStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("KOT status updated", restaurantService.updateKotStatus(id, request.getStatus())));
    }

    @PostMapping("/tables/{id}/reserve")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Book / reserve a table with customer details")
    public ResponseEntity<ApiResponse<TableResponse>> reserveTable(@PathVariable Long id, @RequestBody ReserveTableRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Table reserved successfully", restaurantService.reserveTable(id, request)));
    }

    @PostMapping("/tables/{id}/cancel-reservation")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Cancel a table reservation and make table available")
    public ResponseEntity<ApiResponse<TableResponse>> cancelReservation(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Reservation cancelled", restaurantService.cancelReservation(id)));
    }

    @DeleteMapping("/orders/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Delete an active restaurant order and clear table")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable Long id) {
        restaurantService.deleteOrder(id);
        return ResponseEntity.ok(ApiResponse.ok("Order deleted successfully", null));
    }

    @DeleteMapping("/kot/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Delete a KOT ticket")
    public ResponseEntity<ApiResponse<Void>> deleteKotTicket(@PathVariable Long id) {
        restaurantService.deleteKotTicket(id);
        return ResponseEntity.ok(ApiResponse.ok("KOT ticket deleted successfully", null));
    }

    @PostMapping("/tables/{id}/settle-bill")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Settle table bill and clear table to AVAILABLE")
    public ResponseEntity<ApiResponse<TableResponse>> settleTableBill(
            @PathVariable Long id,
            @RequestBody(required = false) SettleBillRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Table bill settled and cleared", restaurantService.settleTableBill(id, request)));
    }

    @PostMapping("/orders/{id}/settle")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Settle restaurant order (e.g. Takeaway) and generate invoice")
    public ResponseEntity<ApiResponse<OrderResponse>> settleOrder(
            @PathVariable Long id,
            @RequestBody(required = false) SettleBillRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Order settled successfully", restaurantService.settleOrder(id, request)));
    }
}
