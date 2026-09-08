package com.bizflow.analytics.controller;

import com.bizflow.analytics.dto.*;
import com.bizflow.analytics.service.AnalyticsService;
import com.bizflow.payment.PaymentMethod;
import com.bizflow.security.JwtAuthenticationEntryPoint;
import com.bizflow.security.JwtAuthenticationFilter;
import com.bizflow.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AnalyticsController.class)
@AutoConfigureMockMvc(addFilters = false)
class AnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AnalyticsService analyticsService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @WithMockUser(roles = "OWNER")
    void testGetOverview() throws Exception {
        DailySalesPoint salesPoint = DailySalesPoint.builder()
                .date(LocalDate.now())
                .label("Today")
                .revenue(BigDecimal.valueOf(1450.00))
                .orderCount(12)
                .averageOrderValue(BigDecimal.valueOf(120.83))
                .build();

        TopProductPoint topProd = TopProductPoint.builder()
                .productId(1L)
                .productName("Espresso Roast")
                .productType("PHYSICAL")
                .quantitySold(BigDecimal.valueOf(35))
                .totalRevenue(BigDecimal.valueOf(630.00))
                .revenuePercentage(43.4)
                .build();

        PaymentDistributionPoint payDist = PaymentDistributionPoint.builder()
                .paymentMethod(PaymentMethod.CASH)
                .totalAmount(BigDecimal.valueOf(800.00))
                .transactionCount(8)
                .percentage(55.2)
                .build();

        BranchPerformancePoint branchPerf = BranchPerformancePoint.builder()
                .locationId(1L)
                .locationName("Downtown Flagship")
                .locationCode("DT-01")
                .revenue(BigDecimal.valueOf(1450.00))
                .orderCount(12)
                .averageOrderValue(BigDecimal.valueOf(120.83))
                .expenseTotal(BigDecimal.valueOf(320.00))
                .netRevenue(BigDecimal.valueOf(1130.00))
                .revenueSharePercentage(100.0)
                .build();

        AnalyticsOverviewResponse response = AnalyticsOverviewResponse.builder()
                .timeRange(TimeRange.THIS_MONTH)
                .startDate(LocalDate.now().withDayOfMonth(1))
                .endDate(LocalDate.now())
                .currency("INR")
                .largeBusiness(true)
                .revenue(BigDecimal.valueOf(1450.00))
                .orderCount(12)
                .averageOrderValue(BigDecimal.valueOf(120.83))
                .expenseTotal(BigDecimal.valueOf(320.00))
                .netRevenue(BigDecimal.valueOf(1130.00))
                .profitMarginPercentage(77.93)
                .salesTrend(List.of(salesPoint))
                .expenseTrend(List.of())
                .topProducts(List.of(topProd))
                .paymentDistribution(List.of(payDist))
                .customerFrequency(CustomerFrequencyMetrics.builder()
                        .totalCustomers(50)
                        .newCustomersInPeriod(5)
                        .activeCustomersInPeriod(12)
                        .repeatCustomers(4)
                        .repeatCustomerRate(33.3)
                        .averageOrdersPerCustomer(1.0)
                        .averageCustomerLifetimeValue(BigDecimal.valueOf(29.00))
                        .build())
                .branchPerformance(List.of(branchPerf))
                .build();

        when(analyticsService.getOverview(any(), any(), any(), any())).thenReturn(response);

        mockMvc.perform(get("/api/v1/analytics/overview")
                        .param("timeRange", "THIS_MONTH"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.revenue").value(1450.00))
                .andExpect(jsonPath("$.data.orderCount").value(12))
                .andExpect(jsonPath("$.data.topProducts[0].productName").value("Espresso Roast"))
                .andExpect(jsonPath("$.data.paymentDistribution[0].paymentMethod").value("CASH"))
                .andExpect(jsonPath("$.data.branchPerformance[0].locationName").value("Downtown Flagship"));
    }
}
