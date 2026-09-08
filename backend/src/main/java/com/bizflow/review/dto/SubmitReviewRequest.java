package com.bizflow.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitReviewRequest {

    @NotNull(message = "Star rating is required")
    @Min(value = 1, message = "Rating must be at least 1 star")
    @Max(value = 5, message = "Rating cannot exceed 5 stars")
    private Integer rating;

    private String feedbackText;

    @Size(max = 150, message = "Customer name must not exceed 150 characters")
    private String customerName;

    @Size(max = 150, message = "Contact information must not exceed 150 characters")
    private String customerContact;

    private Boolean redirectedToPublicPlatform;
}
