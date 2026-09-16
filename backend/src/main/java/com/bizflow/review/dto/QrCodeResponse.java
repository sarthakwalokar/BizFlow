package com.bizflow.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QrCodeResponse {

    private Long businessId;
    private String businessName;
    private String reviewSlug;
    private String reviewUrl; // Resolved review URL (Google review URL when configured)
    private String googleReviewUrl; // Direct Google review URL if configured
    private String internalReviewUrl; // Internal bizflow review page URL
    private String qrCodeDataUrl; // "data:image/png;base64,..."
}
