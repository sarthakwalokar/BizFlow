package com.bizflow.review.dto;

import com.bizflow.business.BusinessType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicBusinessReviewInfo {

    private Long businessId;
    private String name;
    private BusinessType businessType;
    private String logo;
    private String reviewSlug;
    private String reviewPromptMessage;
    private String publicReviewUrl;
    private boolean reviewEnabled;
}
