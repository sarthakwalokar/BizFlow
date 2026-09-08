package com.bizflow.review.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewSettingsRequest {

    @Size(max = 150, message = "Review slug must not exceed 150 characters")
    private String reviewSlug;

    @Size(max = 500, message = "Public review URL must not exceed 500 characters")
    private String publicReviewUrl;

    @Size(max = 500, message = "Review prompt message must not exceed 500 characters")
    private String reviewPromptMessage;

    private Boolean reviewEnabled;
}
