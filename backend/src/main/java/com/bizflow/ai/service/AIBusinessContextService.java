package com.bizflow.ai.service;

import com.bizflow.ai.dto.AiSuggestedQuestion;
import com.bizflow.billing.OrderItemRepository;
import com.bizflow.billing.OrderRepository;
import com.bizflow.billing.OrderStatus;
import com.bizflow.business.Business;
import com.bizflow.business.BusinessRepository;
import com.bizflow.business.BusinessSize;
import com.bizflow.common.exception.ResourceNotFoundException;
import com.bizflow.customer.Customer;
import com.bizflow.customer.CustomerRepository;
import com.bizflow.expense.ExpenseRepository;
import com.bizflow.payment.PaymentMethod;
import com.bizflow.payment.PaymentStatus;
import com.bizflow.product.Product;
import com.bizflow.product.ProductRepository;
import com.bizflow.review.Review;
import com.bizflow.review.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AIBusinessContextService {

    private final BusinessRepository businessRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ExpenseRepository expenseRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final ReviewRepository reviewRepository;

    public String buildSystemPromptForBusiness(Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", "id", businessId));

        ZoneId zone = ZoneId.systemDefault();
        LocalDate today = LocalDate.now();
        Instant now = Instant.now();

        // 1. Time Ranges
        Instant todayStart = today.atStartOfDay(zone).toInstant();
        Instant todayEnd = today.atTime(LocalTime.MAX).atZone(zone).toInstant();

        LocalDate thisWeekMonday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        Instant weekStart = thisWeekMonday.atStartOfDay(zone).toInstant();

        LocalDate firstDayThisMonth = today.with(TemporalAdjusters.firstDayOfMonth());
        Instant monthStart = firstDayThisMonth.atStartOfDay(zone).toInstant();

        LocalDate firstDayLastMonth = firstDayThisMonth.minusMonths(1);
        LocalDate lastDayLastMonth = firstDayThisMonth.minusDays(1);
        Instant lastMonthStart = firstDayLastMonth.atStartOfDay(zone).toInstant();
        Instant lastMonthEnd = lastDayLastMonth.atTime(LocalTime.MAX).atZone(zone).toInstant();

        // 2. Sales & Revenue Aggregations
        BigDecimal todaySales = orderRepository.sumSalesForDateRange(businessId, todayStart, todayEnd, PaymentStatus.COMPLETED, OrderStatus.COMPLETED);
        long todayOrders = orderRepository.countOrdersForDateRange(businessId, todayStart, todayEnd, OrderStatus.COMPLETED);

        BigDecimal weekSales = orderRepository.sumSalesForDateRange(businessId, weekStart, now, PaymentStatus.COMPLETED, OrderStatus.COMPLETED);
        long weekOrders = orderRepository.countOrdersForDateRange(businessId, weekStart, now, OrderStatus.COMPLETED);

        BigDecimal monthSales = orderRepository.sumSalesForDateRange(businessId, monthStart, now, PaymentStatus.COMPLETED, OrderStatus.COMPLETED);
        long monthOrders = orderRepository.countOrdersForDateRange(businessId, monthStart, now, OrderStatus.COMPLETED);

        BigDecimal lastMonthSales = orderRepository.sumSalesForDateRange(businessId, lastMonthStart, lastMonthEnd, PaymentStatus.COMPLETED, OrderStatus.COMPLETED);
        long lastMonthOrders = orderRepository.countOrdersForDateRange(businessId, lastMonthStart, lastMonthEnd, OrderStatus.COMPLETED);

        BigDecimal monthAov = monthOrders > 0
                ? monthSales.divide(BigDecimal.valueOf(monthOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Sales Growth/Decline
        double salesGrowthPct = 0.0;
        if (lastMonthSales.compareTo(BigDecimal.ZERO) > 0) {
            salesGrowthPct = monthSales.subtract(lastMonthSales)
                    .divide(lastMonthSales, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }

        // 3. Operating Expenses
        BigDecimal monthExpenses = expenseRepository.sumExpensesForDateRange(businessId, firstDayThisMonth, today);
        BigDecimal lastMonthExpenses = expenseRepository.sumExpensesForDateRange(businessId, firstDayLastMonth, lastDayLastMonth);
        BigDecimal netRevenue = monthSales.subtract(monthExpenses);
        double profitMargin = monthSales.compareTo(BigDecimal.ZERO) > 0
                ? netRevenue.divide(monthSales, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;

        List<Object[]> expenseCatRows = expenseRepository.getCategoryBreakdown(businessId, firstDayThisMonth, today);
        StringBuilder expenseBreakdownStr = new StringBuilder();
        for (Object[] row : expenseCatRows) {
            String catName = row[0] != null ? row[0].toString() : "OTHER";
            String totalStr = row[1] != null ? row[1].toString() : "0.00";
            String countStr = row[2] != null ? row[2].toString() : "0";
            expenseBreakdownStr.append(String.format("  - %s: %s %s (%s records)\n",
                    catName, business.getCurrency(), totalStr, countStr));
        }
        if (expenseBreakdownStr.isEmpty()) {
            expenseBreakdownStr.append("  - No operating expenses recorded this month.\n");
        }

        // 4. Products & Low Stock Restock Alerts
        List<Product> allProducts = productRepository.findByBusinessId(businessId);
        List<Product> lowStockProducts = allProducts.stream()
                .filter(p -> p.isActive() && p.isTrackStock() && p.getStockQuantity() <= p.getLowStockThreshold())
                .toList();

        List<Object[]> topProductRows = orderItemRepository.findTopSellingProducts(businessId, null, monthStart, now)
                .stream().limit(5).toList();
        StringBuilder topProductsStr = new StringBuilder();
        for (Object[] row : topProductRows) {
            topProductsStr.append(String.format("  - %s: %s units sold, Total Revenue: %s %s\n",
                    row[1], row[3], business.getCurrency(), ((BigDecimal) row[4]).toPlainString()));
        }
        if (topProductsStr.isEmpty()) {
            topProductsStr.append("  - No product sales recorded this month yet.\n");
        }

        StringBuilder lowStockStr = new StringBuilder();
        for (Product p : lowStockProducts) {
            lowStockStr.append(String.format("  - ⚠️ %s (SKU: %s): Current Stock = %d (Threshold = %d). Needs Restock!\n",
                    p.getName(), p.getSku() != null ? p.getSku() : "N/A", p.getStockQuantity(), p.getLowStockThreshold()));
        }
        if (lowStockStr.isEmpty()) {
            lowStockStr.append("  - All tracked inventory levels are currently healthy and above threshold.\n");
        }

        // 5. Customer Metrics
        long totalCustomers = customerRepository.countByBusinessId(businessId);
        List<Object[]> customerSpendingList = orderRepository.findCustomerSpendingSummaryByBusinessId(businessId);
        long activeCustomersCount = customerSpendingList.size();
        long repeatCustomers = customerSpendingList.stream()
                .filter(row -> row[2] != null && ((Number) row[2]).longValue() > 1)
                .count();
        double repeatRate = totalCustomers > 0 ? ((double) repeatCustomers / totalCustomers) * 100.0 : 0.0;

        // 6. Review & Reputation Metrics
        Double avgRating = reviewRepository.getAverageRating(businessId);
        long totalReviews = reviewRepository.countByBusinessIdAndHiddenFalse(businessId);
        long positiveReviews = reviewRepository.countPositiveReviews(businessId);
        List<Review> recentReviews = reviewRepository.findRecentReviews(businessId, PageRequest.of(0, 5));

        StringBuilder reviewSummaryStr = new StringBuilder();
        reviewSummaryStr.append(String.format("  - Average Rating: %.1f / 5.0 Stars (Total Reviews: %d, Positive: %d)\n",
                avgRating != null ? avgRating : 0.0, totalReviews, positiveReviews));
        for (Review r : recentReviews) {
            reviewSummaryStr.append(String.format("  - %d Stars by %s: \"%s\"%s\n",
                    r.getRating(),
                    r.getCustomerName() != null ? r.getCustomerName() : "Anonymous",
                    r.getFeedbackText() != null ? r.getFeedbackText().replace("\n", " ") : "No text",
                    r.isPositive() ? " [Public]" : " [Private Issue]"));
        }

        // Assemble Final System Prompt
        return String.format("""
                You are BizFlow AI, an executive-level business analyst and advisor for "%s" (Business Type: %s, Currency: %s, Business Size: %s).
                
                You have access to the verified, real-time database snapshot for this business:
                
                --- REVENUE & SALES SNAPSHOT ---
                - Today's Sales: %s %s across %d completed orders.
                - This Week's Sales: %s %s (%d orders).
                - This Month's Sales: %s %s (%d orders, Average Order Value: %s %s).
                - Last Month's Sales: %s %s (%d orders).
                - Month-over-Month Growth: %.1f%% (%s).
                
                --- OPERATING EXPENSES & NET PROFIT ---
                - Total Expenses This Month: %s %s (Last Month: %s %s).
                - Net Revenue This Month: %s %s.
                - Estimated Profit Margin: %.1f%%.
                - Expense Categories Breakdown:
                %s
                --- TOP SELLING PRODUCTS & SERVICES (THIS MONTH) ---
                %s
                --- INVENTORY RESTOCK & LOW STOCK AUDIT ---
                - Tracked Catalog Items: %d products.
                - Items Below Reorder Threshold (%d critical):
                %s
                --- CUSTOMER ACTIVITY & RETENTION ---
                - Total Registered Customer Base: %d.
                - Active Customers This Month: %d.
                - Repeat Customer Rate: %.1f%% (%d repeat buyers).
                
                --- CUSTOMER REPUTATION & REVIEWS ---
                %s
                
                --- INSTRUCTIONS ---
                1. Always base your analysis and calculations strictly on the verified numbers provided above.
                2. Be concise, executive, professional, and actionable.
                3. Use clean Markdown formatting with clear section headers (###), bold numbers, bullet points, and highlight warnings (⚠️, 💡, 📊).
                4. When recommending restocks, reference specific product names and current stock numbers from the snapshot.
                5. Never reveal API keys, database internals, or execute destructive actions. You are strictly a read-only analytical advisor.
                """,
                business.getName(), business.getBusinessType(), business.getCurrency(), business.getBusinessSize(),
                business.getCurrency(), todaySales.toPlainString(), todayOrders,
                business.getCurrency(), weekSales.toPlainString(), weekOrders,
                business.getCurrency(), monthSales.toPlainString(), monthOrders, business.getCurrency(), monthAov.toPlainString(),
                business.getCurrency(), lastMonthSales.toPlainString(), lastMonthOrders,
                salesGrowthPct, salesGrowthPct >= 0 ? "Growth" : "Decline",
                business.getCurrency(), monthExpenses.toPlainString(), business.getCurrency(), lastMonthExpenses.toPlainString(),
                business.getCurrency(), netRevenue.toPlainString(),
                profitMargin,
                expenseBreakdownStr,
                topProductsStr,
                allProducts.size(), lowStockProducts.size(),
                lowStockStr,
                totalCustomers, activeCustomersCount, repeatRate, repeatCustomers,
                reviewSummaryStr
        );
    }

    public List<AiSuggestedQuestion> generateSuggestions(Long businessId) {
        List<AiSuggestedQuestion> suggestions = new ArrayList<>();

        try {
            List<Product> allProducts = productRepository.findByBusinessId(businessId);
            long lowStockCount = allProducts.stream()
                    .filter(p -> p.isActive() && p.isTrackStock() && p.getStockQuantity() <= p.getLowStockThreshold())
                    .count();

            if (lowStockCount > 0) {
                suggestions.add(AiSuggestedQuestion.builder()
                        .id("restock-alert")
                        .category("INVENTORY")
                        .question(String.format("Which %d products need to be restocked immediately?", lowStockCount))
                        .description("Audit items below low-stock threshold")
                        .iconName("AlertTriangle")
                        .urgent(true)
                        .build());
            }

            suggestions.add(AiSuggestedQuestion.builder()
                    .id("sales-month")
                    .category("SALES")
                    .question("How were my sales and revenue this month compared to last month?")
                    .description("Month-over-month performance & AOV")
                    .iconName("TrendingUp")
                    .urgent(false)
                    .build());

            suggestions.add(AiSuggestedQuestion.builder()
                    .id("top-products")
                    .category("SALES")
                    .question("Which products or services are selling the most right now?")
                    .description("Top volume and revenue contributors")
                    .iconName("Package")
                    .urgent(false)
                    .build());

            suggestions.add(AiSuggestedQuestion.builder()
                    .id("expense-breakdown")
                    .category("EXPENSES")
                    .question("What are my biggest operating expenses and how can I optimize them?")
                    .description("Category cost breakdown & margin analysis")
                    .iconName("DollarSign")
                    .urgent(false)
                    .build());

            suggestions.add(AiSuggestedQuestion.builder()
                    .id("customer-retention")
                    .category("CUSTOMERS")
                    .question("How is my customer activity and repeat purchase rate?")
                    .description("Loyalty, active buyers, and retention")
                    .iconName("Users")
                    .urgent(false)
                    .build());

            suggestions.add(AiSuggestedQuestion.builder()
                    .id("review-sentiment")
                    .category("REVIEWS")
                    .question("How are my customer reviews and sentiment performing?")
                    .description("Star ratings, positive highlights & feedback issues")
                    .iconName("Star")
                    .urgent(false)
                    .build());

        } catch (Exception e) {
            log.warn("Error generating dynamic suggestions: {}", e.getMessage());
            // Fallback default suggestions
            suggestions.add(AiSuggestedQuestion.builder()
                    .id("default-sales")
                    .category("SALES")
                    .question("How were my sales this month?")
                    .description("Summary of recent sales and revenue")
                    .iconName("TrendingUp")
                    .urgent(false)
                    .build());
            suggestions.add(AiSuggestedQuestion.builder()
                    .id("default-products")
                    .category("SALES")
                    .question("Which products are selling the most?")
                    .description("Top selling items")
                    .iconName("Package")
                    .urgent(false)
                    .build());
            suggestions.add(AiSuggestedQuestion.builder()
                    .id("default-restock")
                    .category("INVENTORY")
                    .question("Which products should I restock?")
                    .description("Identify low stock items")
                    .iconName("AlertTriangle")
                    .urgent(false)
                    .build());
        }

        return suggestions;
    }
}
