package com.bizflow.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewSettingsResponse {

    private Long businessId;
    private String businessName;
    private String reviewSlug;
    private String publicReviewUrl;
    private String reviewPromptMessage;
    private boolean reviewEnabled;
    private String directReviewPageUrl;
}
