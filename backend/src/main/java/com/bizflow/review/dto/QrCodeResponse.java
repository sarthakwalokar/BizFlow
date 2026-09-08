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
    private String reviewUrl;
    private String qrCodeDataUrl; // "data:image/png;base64,..."
}
