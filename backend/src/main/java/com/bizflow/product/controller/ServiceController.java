package com.bizflow.product.controller;

import com.bizflow.common.api.ApiResponse;
import com.bizflow.product.ProductType;
import com.bizflow.product.dto.ProductRequest;
import com.bizflow.product.dto.ProductResponse;
import com.bizflow.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/services", "/api/services"})
@RequiredArgsConstructor
@Tag(name = "Services", description = "Endpoints for managing billable service offerings")
public class ServiceController {

    private final ProductService productService;

    @GetMapping({"", "/search"})
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Search Services", description = "Returns a filtered list of service offerings for the current business")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getServices(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String search) {
        List<ProductResponse> services = productService.searchProducts(categoryId, ProductType.SERVICE, active, search);
        return ResponseEntity.ok(ApiResponse.success("Services retrieved successfully", services));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get Service Details", description = "Returns service details by ID")
    public ResponseEntity<ApiResponse<ProductResponse>> getServiceById(@PathVariable Long id) {
        ProductResponse service = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Service retrieved successfully", service));
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Create Service", description = "Creates a new billable service for the business")
    public ResponseEntity<ApiResponse<ProductResponse>> createService(@Valid @RequestBody ProductRequest request) {
        request.setProductType(ProductType.SERVICE);
        ProductResponse response = productService.createProduct(request);
        return new ResponseEntity<>(
                ApiResponse.created("Service created successfully", response),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Update Service", description = "Updates details of an existing service")
    public ResponseEntity<ApiResponse<ProductResponse>> updateService(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        request.setProductType(ProductType.SERVICE);
        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Service updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Toggle Service Status", description = "Enables or disables a service in the catalog")
    public ResponseEntity<ApiResponse<ProductResponse>> updateServiceStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        ProductResponse response = productService.updateProductStatus(id, active);
        return ResponseEntity.ok(ApiResponse.success("Service status updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Delete Service", description = "Deletes a service from the business catalog")
    public ResponseEntity<ApiResponse<Void>> deleteService(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Service deleted successfully", null));
    }
}
