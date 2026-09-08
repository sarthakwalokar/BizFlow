package com.bizflow.review.dto;

import com.bizflow.review.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {

    private Long id;
    private Long businessId;
    private Integer rating;
    private String feedbackText;
    private String customerName;
    private String customerContact;
    private boolean positive;
    private boolean redirectedToPublicPlatform;
    private boolean hidden;
    private String moderationNotes;
    private Instant createdAt;
    private Instant updatedAt;

    public static ReviewResponse fromEntity(Review review) {
        if (review == null) {
            return null;
        }

        return ReviewResponse.builder()
                .id(review.getId())
                .businessId(review.getBusinessId())
                .rating(review.getRating())
                .feedbackText(review.getFeedbackText())
                .customerName(review.getCustomerName())
                .customerContact(review.getCustomerContact())
                .positive(review.isPositive())
                .redirectedToPublicPlatform(review.isRedirectedToPublicPlatform())
                .hidden(review.isHidden())
                .moderationNotes(review.getModerationNotes())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
