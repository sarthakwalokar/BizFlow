package com.bizflow.review.controller;

import com.bizflow.business.BusinessType;
import com.bizflow.review.dto.PublicBusinessReviewInfo;
import com.bizflow.review.dto.ReviewResponse;
import com.bizflow.review.dto.SubmitReviewRequest;
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
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PublicReviewController.class)
@AutoConfigureMockMvc(addFilters = false)
class PublicReviewControllerTest {

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
    void testGetPublicReviewInfo() throws Exception {
        PublicBusinessReviewInfo info = PublicBusinessReviewInfo.builder()
                .businessId(1L)
                .name("Artisan Cafe")
                .businessType(BusinessType.CAFE)
                .reviewSlug("artisan-cafe")
                .reviewPromptMessage("How was your latte today?")
                .publicReviewUrl("https://g.page/r/artisan-cafe/review")
                .reviewEnabled(true)
                .build();

        when(reviewService.getPublicBusinessReviewInfo("artisan-cafe")).thenReturn(info);

        mockMvc.perform(get("/api/v1/public/reviews/artisan-cafe"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Artisan Cafe"))
                .andExpect(jsonPath("$.data.reviewSlug").value("artisan-cafe"));
    }

    @Test
    void testSubmitPublicReview_Positive() throws Exception {
        SubmitReviewRequest request = SubmitReviewRequest.builder()
                .rating(5)
                .feedbackText("Outstanding service and great ambiance!")
                .customerName("Jane Doe")
                .redirectedToPublicPlatform(true)
                .build();

        ReviewResponse response = ReviewResponse.builder()
                .id(10L)
                .businessId(1L)
                .rating(5)
                .feedbackText("Outstanding service and great ambiance!")
                .customerName("Jane Doe")
                .positive(true)
                .redirectedToPublicPlatform(true)
                .createdAt(Instant.now())
                .build();

        when(reviewService.submitPublicReview(eq("artisan-cafe"), any(SubmitReviewRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/v1/public/reviews/artisan-cafe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.rating").value(5))
                .andExpect(jsonPath("$.data.positive").value(true));
    }
}
