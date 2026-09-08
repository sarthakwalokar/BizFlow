package com.bizflow.analytics.service;

import com.bizflow.analytics.dto.*;
import com.bizflow.billing.Order;
import com.bizflow.billing.OrderItemRepository;
import com.bizflow.billing.OrderRepository;
import com.bizflow.business.Business;
import com.bizflow.business.BusinessRepository;
import com.bizflow.business.BusinessSize;
import com.bizflow.common.exception.ResourceNotFoundException;
import com.bizflow.customer.CustomerRepository;
import com.bizflow.expense.Expense;
import com.bizflow.expense.ExpenseRepository;
import com.bizflow.inventory.Location;
import com.bizflow.inventory.repository.LocationRepository;
import com.bizflow.payment.PaymentMethod;
import com.bizflow.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ExpenseRepository expenseRepository;
    private final CustomerRepository customerRepository;
    private final BusinessRepository businessRepository;
    private final LocationRepository locationRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd");
    private static final DateTimeFormatter DAY_FORMATTER = DateTimeFormatter.ofPattern("EEE");

    public AnalyticsOverviewResponse getOverview(TimeRange timeRange,
                                                 LocalDate customStartDate,
                                                 LocalDate customEndDate,
                                                 Long locationId) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        if (businessId == null) {
            throw new ResourceNotFoundException("Business context required for analytics.");
        }

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", "id", businessId));

        boolean isLarge = business.getBusinessSize() == BusinessSize.LARGE;
        String currency = business.getCurrency() != null ? business.getCurrency() : "INR";

        // Validate location if provided
        String locationName = null;
        if (locationId != null) {
            Location loc = locationRepository.findByIdAndBusinessId(locationId, businessId)
                    .orElseThrow(() -> new ResourceNotFoundException("Location", "id", locationId));
            locationName = loc.getName();
        }

        // Determine effective dates
        LocalDate today = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate;

        TimeRange effectiveRange = timeRange != null ? timeRange : TimeRange.THIS_MONTH;

        switch (effectiveRange) {
            case TODAY -> {
                startDate = today;
                endDate = today;
            }
            case THIS_WEEK -> {
                startDate = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                endDate = today;
            }
            case THIS_MONTH -> {
                startDate = today.with(TemporalAdjusters.firstDayOfMonth());
                endDate = today;
            }
            case CUSTOM -> {
                startDate = customStartDate != null ? customStartDate : today.minusDays(30);
                endDate = customEndDate != null ? customEndDate : today;
                if (startDate.isAfter(endDate)) {
                    LocalDate tmp = startDate;
                    startDate = endDate;
                    endDate = tmp;
                }
            }
            default -> {
                startDate = today.with(TemporalAdjusters.firstDayOfMonth());
                endDate = today;
            }
        }

        Instant startInstant = startDate.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant endInstant = endDate.atTime(LocalTime.MAX).atZone(ZoneOffset.UTC).toInstant();

        // 1. Core KPIs
        BigDecimal revenue = orderRepository.sumSalesForPeriodAndLocation(businessId, locationId, startInstant, endInstant);
        long orderCount = orderRepository.countOrdersForPeriodAndLocation(businessId, locationId, startInstant, endInstant);
        BigDecimal averageOrderValue = orderCount > 0
                ? revenue.divide(BigDecimal.valueOf(orderCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal expenseTotal = expenseRepository.sumExpensesForPeriodAndLocation(businessId, locationId, startDate, endDate);
        BigDecimal netRevenue = revenue.subtract(expenseTotal);

        double profitMargin = revenue.compareTo(BigDecimal.ZERO) > 0
                ? netRevenue.multiply(BigDecimal.valueOf(100)).divide(revenue, 2, RoundingMode.HALF_UP).doubleValue()
                : 0.0;

        // 2. Sales Trend (Zero-filled for all days in range)
        List<Order> orders = orderRepository.findCompletedOrdersForPeriod(businessId, locationId, startInstant, endInstant);
        Map<LocalDate, List<Order>> ordersByDate = orders.stream()
                .collect(Collectors.groupingBy(o -> o.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate()));

        List<DailySalesPoint> salesTrend = new ArrayList<>();
        LocalDate cur = startDate;
        while (!cur.isAfter(endDate)) {
            List<Order> dayOrders = ordersByDate.getOrDefault(cur, Collections.emptyList());
            BigDecimal dayRev = dayOrders.stream().map(Order::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
            long dayCount = dayOrders.size();
            BigDecimal dayAov = dayCount > 0
                    ? dayRev.divide(BigDecimal.valueOf(dayCount), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            String label = effectiveRange == TimeRange.TODAY || effectiveRange == TimeRange.THIS_WEEK
                    ? cur.format(DAY_FORMATTER)
                    : cur.format(DATE_FORMATTER);

            salesTrend.add(DailySalesPoint.builder()
                    .date(cur)
                    .label(label)
                    .revenue(dayRev)
                    .orderCount(dayCount)
                    .averageOrderValue(dayAov)
                    .build());

            cur = cur.plusDays(1);
        }

        // 3. Expense Trend (Zero-filled for all days in range)
        List<Expense> expenses = expenseRepository.findExpensesForPeriod(businessId, locationId, startDate, endDate);
        Map<LocalDate, List<Expense>> expensesByDate = expenses.stream()
                .collect(Collectors.groupingBy(Expense::getExpenseDate));

        List<DailyExpensePoint> expenseTrend = new ArrayList<>();
        cur = startDate;
        while (!cur.isAfter(endDate)) {
            List<Expense> dayExpenses = expensesByDate.getOrDefault(cur, Collections.emptyList());
            BigDecimal dayExp = dayExpenses.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

            String label = effectiveRange == TimeRange.TODAY || effectiveRange == TimeRange.THIS_WEEK
                    ? cur.format(DAY_FORMATTER)
                    : cur.format(DATE_FORMATTER);

            expenseTrend.add(DailyExpensePoint.builder()
                    .date(cur)
                    .label(label)
                    .amount(dayExp)
                    .expenseCount(dayExpenses.size())
                    .build());

            cur = cur.plusDays(1);
        }

        // 4. Top Selling Products / Services
        List<Object[]> topProductRows = orderItemRepository.findTopSellingProducts(businessId, locationId, startInstant, endInstant);
        List<TopProductPoint> topProducts = new ArrayList<>();
        BigDecimal grandProductRevenue = topProductRows.stream()
                .map(r -> (BigDecimal) r[4])
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        for (int i = 0; i < Math.min(topProductRows.size(), 10); i++) {
            Object[] row = topProductRows.get(i);
            Long prodId = row[0] != null ? ((Number) row[0]).longValue() : null;
            String prodName = (String) row[1];
            String prodType = row[2] != null ? row[2].toString() : "PHYSICAL";
            BigDecimal qty = (BigDecimal) row[3];
            BigDecimal prodRev = (BigDecimal) row[4];

            double revPct = grandProductRevenue.compareTo(BigDecimal.ZERO) > 0
                    ? prodRev.multiply(BigDecimal.valueOf(100)).divide(grandProductRevenue, 2, RoundingMode.HALF_UP).doubleValue()
                    : 0.0;

            topProducts.add(TopProductPoint.builder()
                    .productId(prodId)
                    .productName(prodName)
                    .productType(prodType)
                    .quantitySold(qty)
                    .totalRevenue(prodRev)
                    .revenuePercentage(revPct)
                    .build());
        }

        // 5. Payment Method Distribution
        List<Object[]> paymentRows = orderRepository.findPaymentDistribution(businessId, locationId, startInstant, endInstant);
        List<PaymentDistributionPoint> paymentDist = new ArrayList<>();
        BigDecimal totalPaid = paymentRows.stream()
                .map(r -> (BigDecimal) r[1])
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        for (Object[] row : paymentRows) {
            PaymentMethod method = (PaymentMethod) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            long count = ((Number) row[2]).longValue();

            double pct = totalPaid.compareTo(BigDecimal.ZERO) > 0
                    ? amount.multiply(BigDecimal.valueOf(100)).divide(totalPaid, 2, RoundingMode.HALF_UP).doubleValue()
                    : 0.0;

            paymentDist.add(PaymentDistributionPoint.builder()
                    .paymentMethod(method)
                    .totalAmount(amount)
                    .transactionCount(count)
                    .percentage(pct)
                    .build());
        }

        // 6. Customer Purchase Frequency Metrics
        long totalCustomers = customerRepository.countByBusinessId(businessId);
        long newCustomersInPeriod = customerRepository.countNewCustomersForPeriod(businessId, startInstant, endInstant);

        Map<Long, Long> ordersPerCustomer = orders.stream()
                .filter(o -> o.getCustomerId() != null)
                .collect(Collectors.groupingBy(Order::getCustomerId, Collectors.counting()));

        long activeCustomersInPeriod = ordersPerCustomer.size();
        long repeatCustomers = ordersPerCustomer.values().stream().filter(cnt -> cnt > 1).count();
        double repeatRate = activeCustomersInPeriod > 0
                ? ((double) repeatCustomers / activeCustomersInPeriod) * 100.0
                : 0.0;
        double avgOrdersPerCustomer = activeCustomersInPeriod > 0
                ? ((double) orders.size() / activeCustomersInPeriod)
                : 0.0;

        CustomerFrequencyMetrics customerMetrics = CustomerFrequencyMetrics.builder()
                .totalCustomers(totalCustomers)
                .newCustomersInPeriod(newCustomersInPeriod)
                .activeCustomersInPeriod(activeCustomersInPeriod)
                .repeatCustomers(repeatCustomers)
                .repeatCustomerRate(Math.round(repeatRate * 10.0) / 10.0)
                .averageOrdersPerCustomer(Math.round(avgOrdersPerCustomer * 10.0) / 10.0)
                .averageCustomerLifetimeValue(totalCustomers > 0 ? revenue.divide(BigDecimal.valueOf(totalCustomers), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO)
                .build();

        // 7. Branch-Wise & Location Comparative Analytics (For Large Businesses or multiple branches)
        List<BranchPerformancePoint> branchPoints = new ArrayList<>();
        if (isLarge || locationRepository.countByBusinessId(businessId) > 0) {
            List<Object[]> branchSales = orderRepository.findBranchPerformance(businessId, startInstant, endInstant);
            List<Object[]> branchExpenses = expenseRepository.sumExpensesByBranch(businessId, startDate, endDate);

            Map<Long, BigDecimal> expenseByLoc = new HashMap<>();
            for (Object[] row : branchExpenses) {
                Long locId = ((Number) row[0]).longValue();
                BigDecimal exp = (BigDecimal) row[1];
                expenseByLoc.put(locId, exp);
            }

            BigDecimal totalBranchRev = branchSales.stream()
                    .map(r -> (BigDecimal) r[3])
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            for (Object[] row : branchSales) {
                Long locId = ((Number) row[0]).longValue();
                String name = (String) row[1];
                String code = (String) row[2];
                BigDecimal branchRev = (BigDecimal) row[3];
                long bOrderCount = ((Number) row[4]).longValue();
                BigDecimal bAov = bOrderCount > 0
                        ? branchRev.divide(BigDecimal.valueOf(bOrderCount), 2, RoundingMode.HALF_UP)
                        : BigDecimal.ZERO;
                BigDecimal bExp = expenseByLoc.getOrDefault(locId, BigDecimal.ZERO);
                BigDecimal bNet = branchRev.subtract(bExp);

                double share = totalBranchRev.compareTo(BigDecimal.ZERO) > 0
                        ? branchRev.multiply(BigDecimal.valueOf(100)).divide(totalBranchRev, 2, RoundingMode.HALF_UP).doubleValue()
                        : 0.0;

                branchPoints.add(BranchPerformancePoint.builder()
                        .locationId(locId)
                        .locationName(name)
                        .locationCode(code)
                        .revenue(branchRev)
                        .orderCount(bOrderCount)
                        .averageOrderValue(bAov)
                        .expenseTotal(bExp)
                        .netRevenue(bNet)
                        .revenueSharePercentage(share)
                        .build());
            }
        }

        return AnalyticsOverviewResponse.builder()
                .timeRange(effectiveRange)
                .startDate(startDate)
                .endDate(endDate)
                .currency(currency)
                .locationId(locationId)
                .locationName(locationName)
                .largeBusiness(isLarge)
                .revenue(revenue)
                .orderCount(orderCount)
                .averageOrderValue(averageOrderValue)
                .expenseTotal(expenseTotal)
                .netRevenue(netRevenue)
                .profitMarginPercentage(profitMargin)
                .salesTrend(salesTrend)
                .expenseTrend(expenseTrend)
                .topProducts(topProducts)
                .paymentDistribution(paymentDist)
                .customerFrequency(customerMetrics)
                .branchPerformance(branchPoints)
                .build();
    }
}
