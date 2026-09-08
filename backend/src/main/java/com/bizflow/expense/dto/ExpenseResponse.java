package com.bizflow.expense.dto;

import com.bizflow.expense.Expense;
import com.bizflow.expense.ExpenseCategory;
import com.bizflow.payment.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponse {

    private Long id;
    private Long businessId;
    private ExpenseCategory category;
    private String description;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private LocalDate expenseDate;
    private Long createdById;
    private String createdByName;
    private Instant createdAt;
    private Instant updatedAt;

    public static ExpenseResponse fromEntity(Expense expense) {
        if (expense == null) {
            return null;
        }

        return ExpenseResponse.builder()
                .id(expense.getId())
                .businessId(expense.getBusinessId())
                .category(expense.getCategory())
                .description(expense.getDescription())
                .amount(expense.getAmount())
                .paymentMethod(expense.getPaymentMethod())
                .expenseDate(expense.getExpenseDate())
                .createdById(expense.getCreatedBy() != null ? expense.getCreatedBy().getId() : null)
                .createdByName(expense.getCreatedByName())
                .createdAt(expense.getCreatedAt())
                .updatedAt(expense.getUpdatedAt())
                .build();
    }
}
