package com.bizflow.customer.controller;

import com.bizflow.billing.dto.OrderResponse;
import com.bizflow.common.api.ApiResponse;
import com.bizflow.common.api.PageResponse;
import com.bizflow.customer.dto.CustomerProfileResponse;
import com.bizflow.customer.dto.CustomerRequest;
import com.bizflow.customer.dto.CustomerResponse;
import com.bizflow.customer.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
@Tag(name = "Customers", description = "Customer Directory & CRM Management APIs")
@SecurityRequirement(name = "bearerAuth")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get paginated customers list with search and lifetime purchase stats")
    public ResponseEntity<ApiResponse<PageResponse<CustomerResponse>>> getCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        PageResponse<CustomerResponse> response = customerService.getCustomers(search, page, size, sort);
        return ResponseEntity.ok(ApiResponse.ok("Customers retrieved successfully", response));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Quick search customers for POS autocomplete")
    public ResponseEntity<ApiResponse<List<CustomerResponse>>> quickSearchCustomers(
            @RequestParam(required = false) String query) {
        List<CustomerResponse> response = customerService.quickSearchCustomers(query);
        return ResponseEntity.ok(ApiResponse.ok("Customers search results", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get customer details by ID")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomerById(@PathVariable Long id) {
        CustomerResponse response = customerService.getCustomerById(id);
        return ResponseEntity.ok(ApiResponse.ok("Customer details retrieved", response));
    }

    @GetMapping("/{id}/profile")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get detailed customer profile, lifetime metrics, and purchase history")
    public ResponseEntity<ApiResponse<CustomerProfileResponse>> getCustomerProfile(@PathVariable Long id) {
        CustomerProfileResponse response = customerService.getCustomerProfile(id);
        return ResponseEntity.ok(ApiResponse.ok("Customer profile retrieved successfully", response));
    }

    @GetMapping("/{id}/orders")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get paginated order history for customer")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getCustomerOrders(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<OrderResponse> response = customerService.getCustomerOrders(id, page, size);
        return ResponseEntity.ok(ApiResponse.ok("Customer orders retrieved successfully", response));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Create a new customer")
    public ResponseEntity<ApiResponse<CustomerResponse>> createCustomer(@Valid @RequestBody CustomerRequest request) {
        CustomerResponse response = customerService.createCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Customer created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Update customer details")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request) {
        CustomerResponse response = customerService.updateCustomer(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Customer updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Delete customer (Owner only)")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok(ApiResponse.ok("Customer deleted successfully", null));
    }
}
