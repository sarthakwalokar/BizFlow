package com.bizflow.review.controller;

import com.bizflow.common.api.ApiResponse;
import com.bizflow.review.dto.PublicBusinessReviewInfo;
import com.bizflow.review.dto.ReviewResponse;
import com.bizflow.review.dto.SubmitReviewRequest;
import com.bizflow.review.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/reviews")
@RequiredArgsConstructor
@Tag(name = "Public Reviews", description = "Public Customer Review Page APIs (Unauthenticated)")
public class PublicReviewController {

    private final ReviewService reviewService;

    @GetMapping("/{slugOrId}")
    @Operation(summary = "Get public business metadata for customer review page")
    public ResponseEntity<ApiResponse<PublicBusinessReviewInfo>> getPublicReviewInfo(@PathVariable String slugOrId) {
        PublicBusinessReviewInfo info = reviewService.getPublicBusinessReviewInfo(slugOrId);
        return ResponseEntity.ok(ApiResponse.ok("Business review page details", info));
    }

    @PostMapping("/{slugOrId}")
    @Operation(summary = "Submit a customer review with star rating and feedback")
    public ResponseEntity<ApiResponse<ReviewResponse>> submitReview(
            @PathVariable String slugOrId,
            @Valid @RequestBody SubmitReviewRequest request) {
        ReviewResponse response = reviewService.submitPublicReview(slugOrId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Thank you for your feedback!", response));
    }
}
