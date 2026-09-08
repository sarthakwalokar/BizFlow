package com.bizflow.analytics.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyExpensePoint {
    private LocalDate date;
    private String label;
    private BigDecimal amount;
    private long expenseCount;
}
