package com.bizflow.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiReviewSuggestionResponse {

    private int rating;
    private String generatedReview;
    private List<String> alternativeSuggestions;
    private List<String> highlightTags;
}
