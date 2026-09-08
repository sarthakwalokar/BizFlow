package com.bizflow.expense.dto;

import com.bizflow.expense.ExpenseCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseCategorySummary {
    private ExpenseCategory category;
    private BigDecimal totalAmount;
    private Long transactionCount;
    private Double percentage;
}
