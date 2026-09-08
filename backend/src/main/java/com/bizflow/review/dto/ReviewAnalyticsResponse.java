package com.bizflow.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewAnalyticsResponse {

    private double averageRating;
    private long totalReviews;
    private long positiveReviewsCount;
    private double positivePercentage;
    private long publicPlatformRedirectsCount;
    @Builder.Default
    private List<RatingDistributionItem> ratingDistribution = new ArrayList<>();
    @Builder.Default
    private List<ReviewResponse> recentReviews = new ArrayList<>();
}
