package com.bizflow.analytics.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BranchPerformancePoint {
    private Long locationId;
    private String locationName;
    private String locationCode;
    private BigDecimal revenue;
    private long orderCount;
    private BigDecimal averageOrderValue;
    private BigDecimal expenseTotal;
    private BigDecimal netRevenue;
    private double revenueSharePercentage;
}
