package com.bizflow.analytics.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsOverviewResponse {
    private TimeRange timeRange;
    private LocalDate startDate;
    private LocalDate endDate;
    private String currency;
    private Long locationId;
    private String locationName;
    private boolean largeBusiness;

    // Headline KPIs
    private BigDecimal revenue;
    private long orderCount;
    private BigDecimal averageOrderValue;
    private BigDecimal expenseTotal;
    private BigDecimal netRevenue;
    private double profitMarginPercentage;

    // Charts & Series
    private List<DailySalesPoint> salesTrend;
    private List<DailyExpensePoint> expenseTrend;
    private List<TopProductPoint> topProducts;
    private List<PaymentDistributionPoint> paymentDistribution;
    private CustomerFrequencyMetrics customerFrequency;
    private List<BranchPerformancePoint> branchPerformance;
}
