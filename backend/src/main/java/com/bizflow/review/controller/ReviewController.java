package com.bizflow.review.controller;

import com.bizflow.common.api.ApiResponse;
import com.bizflow.common.api.PageResponse;
import com.bizflow.review.dto.*;
import com.bizflow.review.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@Tag(name = "Review Boost", description = "Review Boost Management & Analytics APIs")
@SecurityRequirement(name = "bearerAuth")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get paginated reviews for the business with filters")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getReviews(
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) Boolean isPositive,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        PageResponse<ReviewResponse> response = reviewService.getReviews(rating, isPositive, search, page, size, sort);
        return ResponseEntity.ok(ApiResponse.ok("Reviews retrieved successfully", response));
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get Review Boost analytics, average rating, and distribution")
    public ResponseEntity<ApiResponse<ReviewAnalyticsResponse>> getReviewAnalytics() {
        ReviewAnalyticsResponse response = reviewService.getReviewAnalytics();
        return ResponseEntity.ok(ApiResponse.ok("Review analytics retrieved successfully", response));
    }

    @GetMapping("/settings")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get Review Boost settings and public review URL")
    public ResponseEntity<ApiResponse<ReviewSettingsResponse>> getReviewSettings() {
        ReviewSettingsResponse response = reviewService.getReviewSettings();
        return ResponseEntity.ok(ApiResponse.ok("Review settings retrieved successfully", response));
    }

    @PutMapping("/settings")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Update Review Boost settings (Owner only)")
    public ResponseEntity<ApiResponse<ReviewSettingsResponse>> updateReviewSettings(
            @Valid @RequestBody ReviewSettingsRequest request) {
        ReviewSettingsResponse response = reviewService.updateReviewSettings(request);
        return ResponseEntity.ok(ApiResponse.ok("Review settings updated successfully", response));
    }

    @GetMapping("/qr-code")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Generate high-resolution QR code for the business review page")
    public ResponseEntity<ApiResponse<QrCodeResponse>> getReviewQrCode() {
        QrCodeResponse response = reviewService.generateQrCode();
        return ResponseEntity.ok(ApiResponse.ok("QR code generated successfully", response));
    }

    @PutMapping("/{id}/moderate")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    @Operation(summary = "Moderate / hide review and attach moderation note")
    public ResponseEntity<ApiResponse<ReviewResponse>> moderateReview(
            @PathVariable Long id,
            @RequestParam boolean hidden,
            @RequestParam(required = false) String notes) {
        ReviewResponse response = reviewService.moderateReview(id, hidden, notes);
        return ResponseEntity.ok(ApiResponse.ok("Review moderation status updated", response));
    }
}
