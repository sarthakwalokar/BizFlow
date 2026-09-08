package com.bizflow.billing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillingSummaryResponse {

    private BigDecimal todaySales;
    private BigDecimal monthSales;
    private BigDecimal todayExpenses;
    private BigDecimal monthExpenses;
    private BigDecimal todayNetRevenue;
    private BigDecimal monthNetRevenue;
    private Long todayOrdersCount;
    private BigDecimal pendingDueAmount;
    private Long totalCustomersCount;
    private String currency;
    private List<OrderResponse> recentOrders;
}
