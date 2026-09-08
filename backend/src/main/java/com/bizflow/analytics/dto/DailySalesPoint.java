package com.bizflow.analytics.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailySalesPoint {
    private LocalDate date;
    private String label;
    private BigDecimal revenue;
    private long orderCount;
    private BigDecimal averageOrderValue;
}
