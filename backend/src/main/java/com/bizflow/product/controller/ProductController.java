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
@RequestMapping({"/api/v1/products", "/api/products"})
@RequiredArgsConstructor
@Tag(name = "Products & Services", description = "Endpoints for managing catalog items (physical products and services)")
public class ProductController {

    private final ProductService productService;

    @GetMapping({"", "/search"})
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Search Catalog Items", description = "Returns a filtered list of products and services for the current business")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) ProductType productType,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String search) {
        List<ProductResponse> products = productService.searchProducts(categoryId, productType, active, search);
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", products));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get Product Details", description = "Returns product or service details by ID")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        ProductResponse product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Product retrieved successfully", product));
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Create Product / Service", description = "Creates a new physical product or service for the business")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        return new ResponseEntity<>(
                ApiResponse.created("Product created successfully", response),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Update Product / Service", description = "Updates details of an existing product or service")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Toggle Product Status", description = "Enables or disables a product in the catalog")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProductStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        ProductResponse response = productService.updateProductStatus(id, active);
        return ResponseEntity.ok(ApiResponse.success("Product status updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Delete Product", description = "Deletes a product or service from the business catalog")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }
}
