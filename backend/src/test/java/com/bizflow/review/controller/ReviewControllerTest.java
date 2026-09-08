package com.bizflow.review.controller;

import com.bizflow.common.api.PageResponse;
import com.bizflow.review.dto.*;
import com.bizflow.review.service.ReviewService;
import com.bizflow.security.JwtAuthenticationEntryPoint;
import com.bizflow.security.JwtAuthenticationFilter;
import com.bizflow.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ReviewController.class)
@AutoConfigureMockMvc(addFilters = false)
class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ReviewService reviewService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @WithMockUser(roles = "OWNER")
    void testGetReviews() throws Exception {
        ReviewResponse response = ReviewResponse.builder()
                .id(1L)
                .businessId(10L)
                .rating(5)
                .feedbackText("Love the fresh pastries!")
                .customerName("Emily Rose")
                .positive(true)
                .createdAt(Instant.now())
                .build();

        PageResponse<ReviewResponse> pageResponse = PageResponse.<ReviewResponse>builder()
                .content(Collections.singletonList(response))
                .pageNumber(0)
                .pageSize(20)
                .totalElements(1L)
                .totalPages(1)
                .isLast(true)
                .build();

        when(reviewService.getReviews(any(), any(), any(), anyInt(), anyInt(), anyString())).thenReturn(pageResponse);

        mockMvc.perform(get("/api/v1/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].rating").value(5))
                .andExpect(jsonPath("$.data.content[0].customerName").value("Emily Rose"));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void testGetReviewAnalytics() throws Exception {
        RatingDistributionItem item5 = RatingDistributionItem.builder()
                .stars(5)
                .count(45L)
                .percentage(90.0)
                .build();

        ReviewAnalyticsResponse analytics = ReviewAnalyticsResponse.builder()
                .averageRating(4.9)
                .totalReviews(50L)
                .positiveReviewsCount(48L)
                .positivePercentage(96.0)
                .publicPlatformRedirectsCount(38L)
                .ratingDistribution(List.of(item5))
                .recentReviews(Collections.emptyList())
                .build();

        when(reviewService.getReviewAnalytics()).thenReturn(analytics);

        mockMvc.perform(get("/api/v1/reviews/analytics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.averageRating").value(4.9))
                .andExpect(jsonPath("$.data.positivePercentage").value(96.0));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void testGetReviewQrCode() throws Exception {
        QrCodeResponse qrCode = QrCodeResponse.builder()
                .businessId(10L)
                .businessName("Artisan Cafe")
                .reviewSlug("artisan-cafe")
                .reviewUrl("http://localhost:5173/review/artisan-cafe")
                .qrCodeDataUrl("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...")
                .build();

        when(reviewService.generateQrCode()).thenReturn(qrCode);

        mockMvc.perform(get("/api/v1/reviews/qr-code"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.reviewSlug").value("artisan-cafe"))
                .andExpect(jsonPath("$.data.qrCodeDataUrl").exists());
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void testUpdateReviewSettings() throws Exception {
        ReviewSettingsRequest request = ReviewSettingsRequest.builder()
                .reviewSlug("artisan-cafe-prime")
                .publicReviewUrl("https://g.page/r/artisan-cafe/review")
                .reviewPromptMessage("How was your experience with us?")
                .reviewEnabled(true)
                .build();

        ReviewSettingsResponse response = ReviewSettingsResponse.builder()
                .businessId(10L)
                .businessName("Artisan Cafe")
                .reviewSlug("artisan-cafe-prime")
                .publicReviewUrl("https://g.page/r/artisan-cafe/review")
                .reviewPromptMessage("How was your experience with us?")
                .reviewEnabled(true)
                .directReviewPageUrl("http://localhost:5173/review/artisan-cafe-prime")
                .build();

        when(reviewService.updateReviewSettings(any(ReviewSettingsRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/reviews/settings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.reviewSlug").value("artisan-cafe-prime"));
    }
}
