package com.bizflow.report.service;

import com.bizflow.billing.Order;
import com.bizflow.billing.OrderItemRepository;
import com.bizflow.billing.OrderRepository;
import com.bizflow.business.Business;
import com.bizflow.business.BusinessRepository;
import com.bizflow.common.exception.ResourceNotFoundException;
import com.bizflow.customer.Customer;
import com.bizflow.customer.CustomerRepository;
import com.bizflow.expense.Expense;
import com.bizflow.expense.ExpenseRepository;
import com.bizflow.inventory.repository.LocationRepository;
import com.bizflow.product.Product;
import com.bizflow.product.ProductRepository;
import com.bizflow.report.dto.*;
import com.bizflow.review.Review;
import com.bizflow.review.ReviewRepository;
import com.bizflow.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportDataService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ExpenseRepository expenseRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final BusinessRepository businessRepository;
    private final LocationRepository locationRepository;

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public ReportDataResponse generateReportData(ReportFilterRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        if (businessId == null) {
            throw new ResourceNotFoundException("Business context is required to generate reports.");
        }

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", "id", businessId));

        String currency = business.getCurrency() != null ? business.getCurrency() : "INR";
        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.now().minusDays(30);
        LocalDate endDate = request.getEndDate() != null ? request.getEndDate() : LocalDate.now();
        if (startDate.isAfter(endDate)) {
            LocalDate tmp = startDate;
            startDate = endDate;
            endDate = tmp;
        }

        Instant startInstant = startDate.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant endInstant = endDate.atTime(LocalTime.MAX).atZone(ZoneOffset.UTC).toInstant();

        ReportType reportType = request.getReportType() != null ? request.getReportType() : ReportType.SALES;

        return switch (reportType) {
            case SALES -> generateSalesReport(business, startDate, endDate, startInstant, endInstant, request.getLocationId(), currency);
            case EXPENSES -> generateExpenseReport(business, startDate, endDate, request.getLocationId(), currency);
            case CUSTOMERS -> generateCustomerReport(business, startDate, endDate, startInstant, endInstant, currency);
            case PRODUCTS -> generateProductReport(business, startInstant, endInstant, request.getLocationId(), currency);
            case REVIEWS -> generateReviewReport(business, startDate, endDate, startInstant, endInstant, currency);
        };
    }

    private ReportDataResponse generateSalesReport(Business business,
                                                   LocalDate startDate,
                                                   LocalDate endDate,
                                                   Instant startInstant,
                                                   Instant endInstant,
                                                   Long locationId,
                                                   String currency) {
        Long businessId = business.getId();
        List<Order> orders = orderRepository.findCompletedOrdersForPeriod(businessId, locationId, startInstant, endInstant);

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalSubtotal = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;

        List<Map<String, Object>> rows = new ArrayList<>();
        for (Order o : orders) {
            totalRevenue = totalRevenue.add(o.getTotal());
            totalSubtotal = totalSubtotal.add(o.getSubtotal());
            totalDiscount = totalDiscount.add(o.getDiscount());
            totalTax = totalTax.add(o.getTax());

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("invoiceNumber", o.getInvoiceNumber());
            row.put("createdAt", o.getCreatedAt().atZone(ZoneId.systemDefault()).format(DATE_TIME_FORMATTER));
            row.put("customerName", o.getCustomer() != null ? o.getCustomer().getName() : "Guest Customer");
            row.put("itemsCount", o.getItems().size());
            row.put("subtotal", o.getSubtotal());
            row.put("discount", o.getDiscount());
            row.put("tax", o.getTax());
            row.put("total", o.getTotal());
            row.put("paymentMethod", o.getPaymentMethod().name());
            row.put("paymentStatus", o.getPaymentStatus().name());
            row.put("locationName", o.getLocationName() != null ? o.getLocationName() : "Main Branch");
            row.put("createdBy", o.getCreatedBy());
            rows.add(row);
        }

        BigDecimal aov = !orders.isEmpty()
                ? totalRevenue.divide(BigDecimal.valueOf(orders.size()), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        List<ReportSummaryCard> summaryCards = List.of(
                ReportSummaryCard.builder().title("Total Sales Revenue").value(totalRevenue.toString() + " " + currency).subtitle(orders.size() + " paid invoices").build(),
                ReportSummaryCard.builder().title("Average Order Value").value(aov.toString() + " " + currency).subtitle("Per customer ticket").build(),
                ReportSummaryCard.builder().title("Discounts Given").value(totalDiscount.toString() + " " + currency).subtitle("Customer promotions").build(),
                ReportSummaryCard.builder().title("Tax Collected").value(totalTax.toString() + " " + currency).subtitle("VAT / GST Total").build()
        );

        List<ReportColumn> columns = List.of(
                ReportColumn.builder().key("invoiceNumber").label("Invoice #").type("STRING").align("LEFT").build(),
                ReportColumn.builder().key("createdAt").label("Date & Time").type("DATE").align("LEFT").build(),
                ReportColumn.builder().key("customerName").label("Customer").type("STRING").align("LEFT").build(),
                ReportColumn.builder().key("itemsCount").label("Items").type("NUMBER").align("CENTER").build(),
                ReportColumn.builder().key("subtotal").label("Subtotal (" + currency + ")").type("CURRENCY").align("RIGHT").build(),
                ReportColumn.builder().key("discount").label("Discount (" + currency + ")").type("CURRENCY").align("RIGHT").build(),
                ReportColumn.builder().key("tax").label("Tax (" + currency + ")").type("CURRENCY").align("RIGHT").build(),
                ReportColumn.builder().key("total").label("Total (" + currency + ")").type("CURRENCY").align("RIGHT").build(),
                ReportColumn.builder().key("paymentMethod").label("Method").type("BADGE").align("CENTER").build(),
                ReportColumn.builder().key("locationName").label("Branch").type("STRING").align("LEFT").build()
        );

        return ReportDataResponse.builder()
                .reportType(ReportType.SALES)
                .title("Sales & Revenue Ledger Report")
                .businessName(business.getName())
                .currency(currency)
                .startDate(startDate)
                .endDate(endDate)
                .generatedAt(LocalDateTime.now())
                .summaryCards(summaryCards)
                .columns(columns)
                .rows(rows)
                .totalRows(rows.size())
                .build();
    }

    private ReportDataResponse generateExpenseReport(Business business,
                                                     LocalDate startDate,
                                                     LocalDate endDate,
                                                     Long locationId,
                                                     String currency) {
        Long businessId = business.getId();
        List<Expense> expenses = expenseRepository.findExpensesForPeriod(businessId, locationId, startDate, endDate);

        BigDecimal totalAmount = BigDecimal.ZERO;
        Map<String, BigDecimal> categorySums = new HashMap<>();

        List<Map<String, Object>> rows = new ArrayList<>();
        for (Expense e : expenses) {
            totalAmount = totalAmount.add(e.getAmount());
            categorySums.merge(e.getCategory().name(), e.getAmount(), BigDecimal::add);

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", e.getId());
            row.put("expenseDate", e.getExpenseDate().format(DATE_FORMATTER));
            row.put("category", e.getCategory().name());
            row.put("description", e.getDescription() != null ? e.getDescription() : "-");
            row.put("amount", e.getAmount());
            row.put("paymentMethod", e.getPaymentMethod().name());
            row.put("locationName", e.getLocationName() != null ? e.getLocationName() : "Main Branch");
            row.put("createdByName", e.getCreatedByName() != null ? e.getCreatedByName() : "System");
            rows.add(row);
        }

        String topCat = categorySums.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(entry -> entry.getKey() + " (" + entry.getValue() + " " + currency + ")")
                .orElse("None");

        BigDecimal avgExpense = !expenses.isEmpty()
                ? totalAmount.divide(BigDecimal.valueOf(expenses.size()), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        List<ReportSummaryCard> summaryCards = List.of(
                ReportSummaryCard.builder().title("Total Operating Expenses").value(totalAmount.toString() + " " + currency).subtitle(expenses.size() + " expense vouchers").build(),
                ReportSummaryCard.builder().title("Average Expense Amount").value(avgExpense.toString() + " " + currency).subtitle("Per recorded entry").build(),
                ReportSummaryCard.builder().title("Top Expense Category").value(topCat).subtitle("Highest outflow bucket").build(),
                ReportSummaryCard.builder().title("Categories Active").value(String.valueOf(categorySums.size())).subtitle("Distinct expense types").build()
        );

        List<ReportColumn> columns = List.of(
                ReportColumn.builder().key("expenseDate").label("Expense Date").type("DATE").align("LEFT").build(),
                ReportColumn.builder().key("category").label("Category").type("BADGE").align("LEFT").build(),
                ReportColumn.builder().key("description").label("Description").type("STRING").align("LEFT").build(),
                ReportColumn.builder().key("amount").label("Amount (" + currency + ")").type("CURRENCY").align("RIGHT").build(),
                ReportColumn.builder().key("paymentMethod").label("Payment Method").type("BADGE").align("CENTER").build(),
                ReportColumn.builder().key("locationName").label("Branch").type("STRING").align("LEFT").build(),
                ReportColumn.builder().key("createdByName").label("Recorded By").type("STRING").align("LEFT").build()
        );

        return ReportDataResponse.builder()
                .reportType(ReportType.EXPENSES)
                .title("Operating Expenses Statement")
                .businessName(business.getName())
                .currency(currency)
                .startDate(startDate)
                .endDate(endDate)
                .generatedAt(LocalDateTime.now())
                .summaryCards(summaryCards)
                .columns(columns)
                .rows(rows)
                .totalRows(rows.size())
                .build();
    }

    private ReportDataResponse generateCustomerReport(Business business,
                                                      LocalDate startDate,
                                                      LocalDate endDate,
                                                      Instant startInstant,
                                                      Instant endInstant,
                                                      String currency) {
        Long businessId = business.getId();
        List<Customer> customers = customerRepository.findByBusinessIdOrderByNameAsc(businessId);
        List<Object[]> spendSummaries = orderRepository.findCustomerSpendingSummaryByBusinessId(businessId);

        Map<Long, Object[]> summaryMap = new HashMap<>();
        for (Object[] row : spendSummaries) {
            Long cId = (Long) row[0];
            summaryMap.put(cId, row);
        }

        BigDecimal grandTotalSpent = BigDecimal.ZERO;
        long totalOrdersAll = 0;

        List<Map<String, Object>> rows = new ArrayList<>();
        for (Customer c : customers) {
            Object[] spendRow = summaryMap.get(c.getId());
            BigDecimal totalSpent = spendRow != null ? (BigDecimal) spendRow[1] : BigDecimal.ZERO;
            long ordersCount = spendRow != null ? ((Number) spendRow[2]).longValue() : 0;
            Instant lastPurchaseInstant = spendRow != null ? (Instant) spendRow[3] : null;

            grandTotalSpent = grandTotalSpent.add(totalSpent);
            totalOrdersAll += ordersCount;

            BigDecimal avgBill = ordersCount > 0
                    ? totalSpent.divide(BigDecimal.valueOf(ordersCount), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("name", c.getName());
            row.put("phone", c.getPhone() != null ? c.getPhone() : "-");
            row.put("email", c.getEmail() != null ? c.getEmail() : "-");
            row.put("ordersCount", ordersCount);
            row.put("totalSpent", totalSpent);
            row.put("averageBill", avgBill);
            row.put("joinedDate", c.getCreatedAt().atZone(ZoneId.systemDefault()).format(DATE_FORMATTER));
            row.put("lastPurchase", lastPurchaseInstant != null
                    ? lastPurchaseInstant.atZone(ZoneId.systemDefault()).format(DATE_FORMATTER)
                    : "No purchases");
            rows.add(row);
        }

        // Sort by total spent descending
        rows.sort((a, b) -> ((BigDecimal) b.get("totalSpent")).compareTo((BigDecimal) a.get("totalSpent")));

        BigDecimal avgCustomerValue = !customers.isEmpty()
                ? grandTotalSpent.divide(BigDecimal.valueOf(customers.size()), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        List<ReportSummaryCard> summaryCards = List.of(
                ReportSummaryCard.builder().title("Registered Customers").value(String.valueOf(customers.size())).subtitle("Total client base").build(),
                ReportSummaryCard.builder().title("Cumulative Client Spending").value(grandTotalSpent.toString() + " " + currency).subtitle(totalOrdersAll + " total lifetime orders").build(),
                ReportSummaryCard.builder().title("Avg Customer Lifetime Value").value(avgCustomerValue.toString() + " " + currency).subtitle("Per registered customer").build()
        );

        List<ReportColumn> columns = List.of(
                ReportColumn.builder().key("name").label("Customer Name").type("STRING").align("LEFT").build(),
                ReportColumn.builder().key("phone").label("Phone Number").type("STRING").align("LEFT").build(),
                ReportColumn.builder().key("email").label("Email Address").type("STRING").align("LEFT").build(),
                ReportColumn.builder().key("ordersCount").label("Total Orders").type("NUMBER").align("CENTER").build(),
                ReportColumn.builder().key("totalSpent").label("Total Spent (" + currency + ")").type("CURRENCY").align("RIGHT").build(),
                ReportColumn.builder().key("averageBill").label("Avg Ticket (" + currency + ")").type("CURRENCY").align("RIGHT").build(),
                ReportColumn.builder().key("lastPurchase").label("Last Purchase").type("DATE").align("LEFT").build(),
                ReportColumn.builder().key("joinedDate").label("Member Since").type("DATE").align("LEFT").build()
        );

        return ReportDataResponse.builder()
                .reportType(ReportType.CUSTOMERS)
                .title("Customer Performance & Lifetime Value Ledger")
                .businessName(business.getName())
                .currency(currency)
                .startDate(startDate)
                .endDate(endDate)
                .generatedAt(LocalDateTime.now())
                .summaryCards(summaryCards)
                .columns(columns)
                .rows(rows)
                .totalRows(rows.size())
                .build();
    }

    private ReportDataResponse generateProductReport(Business business,
                                                     Instant startInstant,
                                                     Instant endInstant,
                                                     Long locationId,
                                                     String currency) {
        Long businessId = business.getId();
        List<Product> products = productRepository.findByBusinessIdOrderByNameAsc(businessId);
        List<Object[]> salesByProduct = orderItemRepository.findTopSellingProducts(businessId, locationId, startInstant, endInstant);

        Map<Long, Object[]> salesMap = new HashMap<>();
        for (Object[] row : salesByProduct) {
            Long pId = row[0] != null ? ((Number) row[0]).longValue() : null;
            if (pId != null) {
                salesMap.put(pId, row);
            }
        }

        BigDecimal totalStockValuation = BigDecimal.ZERO;
        long totalStockUnits = 0;
        BigDecimal totalProductRevenue = BigDecimal.ZERO;

        List<Map<String, Object>> rows = new ArrayList<>();
        for (Product p : products) {
            Object[] salesRow = salesMap.get(p.getId());
            BigDecimal unitsSold = salesRow != null ? (BigDecimal) salesRow[3] : BigDecimal.ZERO;
            BigDecimal revGenerated = salesRow != null ? (BigDecimal) salesRow[4] : BigDecimal.ZERO;

            totalProductRevenue = totalProductRevenue.add(revGenerated);
            if (p.isTrackStock()) {
                totalStockUnits += p.getStockQuantity();
                BigDecimal cost = p.getCostPrice() != null ? p.getCostPrice() : p.getPrice();
                totalStockValuation = totalStockValuation.add(cost.multiply(BigDecimal.valueOf(p.getStockQuantity())));
            }

            Double marginPct = (p.getCostPrice() != null && p.getCostPrice().compareTo(BigDecimal.ZERO) > 0 && p.getPrice().compareTo(BigDecimal.ZERO) > 0)
                    ? p.getPrice().subtract(p.getCostPrice()).multiply(BigDecimal.valueOf(100)).divide(p.getPrice(), 1, RoundingMode.HALF_UP).doubleValue()
                    : null;

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("name", p.getName());
            row.put("productType", p.getProductType().name());
            row.put("sku", p.getSku() != null ? p.getSku() : "-");
            row.put("categoryName", p.getCategory() != null ? p.getCategory().getName() : "Unassigned");
            row.put("price", p.getPrice());
            row.put("costPrice", p.getCostPrice() != null ? p.getCostPrice() : BigDecimal.ZERO);
            row.put("margin", marginPct != null ? marginPct + "%" : "-");
            row.put("unitsSold", unitsSold);
            row.put("revenueGenerated", revGenerated);
            row.put("stockQuantity", p.isTrackStock() ? p.getStockQuantity() : "Untracked");
            row.put("active", p.isActive() ? "Active" : "Archived");
            rows.add(row);
        }

        // Sort by revenue generated descending
        rows.sort((a, b) -> ((BigDecimal) b.get("revenueGenerated")).compareTo((BigDecimal) a.get("revenueGenerated")));

        List<ReportSummaryCard> summaryCards = List.of(
                ReportSummaryCard.builder().title("Catalog Items").value(String.valueOf(products.size())).subtitle("Products & Services").build(),
                ReportSummaryCard.builder().title("Period Revenue Generated").value(totalProductRevenue.toString() + " " + currency).subtitle("Across all sales").build(),
                ReportSummaryCard.builder().title("Stock on Hand").value(totalStockUnits + " units").subtitle("Tracked inventory").build(),
                ReportSummaryCard.builder().title("Inventory Asset Valuation").value(totalStockValuation.toString() + " " + currency).subtitle("At unit cost value").build()
        );

        List<ReportColumn> columns = List.of(
                ReportColumn.builder().key("name").label("Item Title").type("STRING").align("LEFT").build(),
                ReportColumn.builder().key("productType").label("Classification").type("BADGE").align("CENTER").build(),
                ReportColumn.builder().key("sku").label("SKU Code").type("STRING").align("LEFT").build(),
                ReportColumn.builder().key("categoryName").label("Category").type("STRING").align("LEFT").build(),
                ReportColumn.builder().key("price").label("Selling Price (" + currency + ")").type("CURRENCY").align("RIGHT").build(),
                ReportColumn.builder().key("costPrice").label("Cost Price (" + currency + ")").type("CURRENCY").align("RIGHT").build(),
                ReportColumn.builder().key("margin").label("Margin %").type("STRING").align("CENTER").build(),
                ReportColumn.builder().key("unitsSold").label("Units Sold").type("NUMBER").align("RIGHT").build(),
                ReportColumn.builder().key("revenueGenerated").label("Revenue (" + currency + ")").type("CURRENCY").align("RIGHT").build(),
                ReportColumn.builder().key("stockQuantity").label("Stock Balance").type("STRING").align("CENTER").build()
        );

        return ReportDataResponse.builder()
                .reportType(ReportType.PRODUCTS)
                .title("Product & Service Sales Performance Report")
                .businessName(business.getName())
                .currency(currency)
                .startDate(LocalDate.now().minusDays(30))
                .endDate(LocalDate.now())
                .generatedAt(LocalDateTime.now())
                .summaryCards(summaryCards)
                .columns(columns)
                .rows(rows)
                .totalRows(rows.size())
                .build();
    }

    private ReportDataResponse generateReviewReport(Business business,
                                                    LocalDate startDate,
                                                    LocalDate endDate,
                                                    Instant startInstant,
                                                    Instant endInstant,
                                                    String currency) {
        Long businessId = business.getId();
        List<Review> reviews = reviewRepository.findReviewsForPeriod(businessId, startInstant, endInstant);

        double avgRating = reviewRepository.getAverageRating(businessId);
        long positiveCount = reviews.stream().filter(Review::isPositive).count();
        long redirectsCount = reviews.stream().filter(Review::isRedirectedToPublicPlatform).count();

        List<Map<String, Object>> rows = new ArrayList<>();
        for (Review r : reviews) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("createdAt", r.getCreatedAt().atZone(ZoneId.systemDefault()).format(DATE_FORMATTER));
            row.put("customerName", r.getCustomerName() != null ? r.getCustomerName() : "Anonymous Guest");
            row.put("customerContact", r.getCustomerContact() != null ? r.getCustomerContact() : "-");
            row.put("rating", r.getRating() + " ★");
            row.put("feedbackText", r.getFeedbackText() != null ? r.getFeedbackText() : "-");
            row.put("positive", r.isPositive() ? "Positive (4-5★)" : "Constructive (1-3★)");
            row.put("redirected", r.isRedirectedToPublicPlatform() ? "Boosted to Public Platform" : "Internal Private Note");
            rows.add(row);
        }

        List<ReportSummaryCard> summaryCards = List.of(
                ReportSummaryCard.builder().title("Average Business Rating").value(String.format("%.1f ★", avgRating)).subtitle("Overall score").build(),
                ReportSummaryCard.builder().title("Period Reviews").value(String.valueOf(reviews.size())).subtitle("Total feedback logged").build(),
                ReportSummaryCard.builder().title("Positive Promoters").value(positiveCount + " (" + (reviews.isEmpty() ? 0 : (positiveCount * 100 / reviews.size())) + "%)").subtitle("4 & 5 Star Ratings").build(),
                ReportSummaryCard.builder().title("Public Platform Boosts").value(String.valueOf(redirectsCount)).subtitle("Redirected to Google / TripAdvisor").build()
        );

        List<ReportColumn> columns = List.of(
                ReportColumn.builder().key("createdAt").label("Review Date").type("DATE").align("LEFT").build(),
                ReportColumn.builder().key("customerName").label("Customer").type("STRING").align("LEFT").build(),
                ReportColumn.builder().key("customerContact").label("Contact").type("STRING").align("LEFT").build(),
                ReportColumn.builder().key("rating").label("Score").type("BADGE").align("CENTER").build(),
                ReportColumn.builder().key("feedbackText").label("Feedback & Comments").type("STRING").align("LEFT").build(),
                ReportColumn.builder().key("positive").label("Sentiment").type("BADGE").align("CENTER").build(),
                ReportColumn.builder().key("redirected").label("Review Boost Action").type("STRING").align("LEFT").build()
        );

        return ReportDataResponse.builder()
                .reportType(ReportType.REVIEWS)
                .title("Customer Feedback & Review Boost Audit")
                .businessName(business.getName())
                .currency(currency)
                .startDate(startDate)
                .endDate(endDate)
                .generatedAt(LocalDateTime.now())
                .summaryCards(summaryCards)
                .columns(columns)
                .rows(rows)
                .totalRows(rows.size())
                .build();
    }
}
