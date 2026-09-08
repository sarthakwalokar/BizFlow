package com.bizflow.expense.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseSummaryResponse {

    private BigDecimal todayExpenses;
    private BigDecimal monthExpenses;
    private BigDecimal totalExpenses;
    @Builder.Default
    private List<ExpenseCategorySummary> categoryBreakdown = new ArrayList<>();
    @Builder.Default
    private List<ExpenseResponse> recentExpenses = new ArrayList<>();
}
