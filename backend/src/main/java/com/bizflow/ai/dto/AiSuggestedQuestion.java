package com.bizflow.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiSuggestedQuestion {
    private String id;
    private String category; // SALES, INVENTORY, EXPENSES, REVIEWS, STRATEGY
    private String question;
    private String description;
    private String iconName; // e.g. "TrendingUp", "AlertTriangle", "DollarSign", "Star"
    private boolean urgent;
}
