package com.bizflow.billing.service;

import com.bizflow.billing.*;
import com.bizflow.billing.dto.*;
import com.bizflow.business.Business;
import com.bizflow.business.BusinessRepository;
import com.bizflow.common.api.PageResponse;
import com.bizflow.common.exception.BadRequestException;
import com.bizflow.common.exception.ResourceNotFoundException;
import com.bizflow.customer.Customer;
import com.bizflow.customer.CustomerRepository;
import com.bizflow.payment.Payment;
import com.bizflow.payment.PaymentMethod;
import com.bizflow.payment.PaymentRepository;
import com.bizflow.payment.PaymentStatus;
import com.bizflow.product.Product;
import com.bizflow.product.ProductRepository;
import com.bizflow.product.ProductType;
import com.bizflow.security.SecurityUtils;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.bizflow.expense.ExpenseRepository;
import com.bizflow.inventory.MovementType;
import com.bizflow.inventory.ReferenceType;
import com.bizflow.inventory.StockMovement;
import com.bizflow.inventory.repository.StockMovementRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillingService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final BusinessRepository businessRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final ExpenseRepository expenseRepository;
    private final StockMovementRepository stockMovementRepository;

    private static final SecureRandom RANDOM = new SecureRandom();

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        String creatorName = SecurityUtils.getCurrentUserPrincipal().getFullName();
        Long creatorUserId = SecurityUtils.getCurrentUserId();

        log.info("Creating order for business {} by user {}", businessId, creatorName);

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", "id", businessId));

        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findByIdAndBusinessId(request.getCustomerId(), businessId)
                    .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Order must contain at least one item line.");
        }

        // 1. Calculate subtotal and build items
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderItemRequest itemReq : request.getItems()) {
            BigDecimal qty = itemReq.getQuantity() != null ? itemReq.getQuantity() : BigDecimal.ONE;
            BigDecimal price = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : BigDecimal.ZERO;

            if (qty.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Item quantity must be greater than zero for '" + itemReq.getProductName() + "'.");
            }
            if (price.compareTo(BigDecimal.ZERO) < 0) {
                throw new BadRequestException("Unit price cannot be negative for '" + itemReq.getProductName() + "'.");
            }

            BigDecimal itemTotal = qty.multiply(price).setScale(2, RoundingMode.HALF_UP);
            subtotal = subtotal.add(itemTotal);

            Product product = null;
            ProductType type = ProductType.PHYSICAL;
            if (itemReq.getProductType() != null) {
                try {
                    type = ProductType.valueOf(itemReq.getProductType().toUpperCase());
                } catch (IllegalArgumentException ignored) {
                }
            }

            if (itemReq.getProductId() != null) {
                product = productRepository.findByIdAndBusinessId(itemReq.getProductId(), businessId).orElse(null);
                if (product != null) {
                    type = product.getProductType();
                    // Validate available stock for physical products when stock tracking is enabled
                    if (business.isInventoryEnabled() && type == ProductType.PHYSICAL && product.isTrackStock()) {
                        int availableStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                        int requestedQty = qty.intValue();
                        if (availableStock < requestedQty) {
                            throw new BadRequestException("Insufficient stock for '" + product.getName() + "'. Available: " + availableStock + ", Requested: " + requestedQty);
                        }
                    }
                }
            }

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .productNameSnapshot(itemReq.getProductName().trim())
                    .productType(type)
                    .quantity(qty)
                    .unitPrice(price)
                    .total(itemTotal)
                    .build();

            orderItems.add(orderItem);
        }

        // 2. Compute discount
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (request.getDiscount() != null && request.getDiscount().compareTo(BigDecimal.ZERO) > 0) {
            if (Boolean.TRUE.equals(request.getIsPercentageDiscount())) {
                discountAmount = subtotal.multiply(request.getDiscount())
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            } else {
                discountAmount = request.getDiscount().setScale(2, RoundingMode.HALF_UP);
            }
            if (discountAmount.compareTo(subtotal) > 0) {
                discountAmount = subtotal;
            }
        }

        BigDecimal netAmount = subtotal.subtract(discountAmount);

        // 3. Compute tax
        BigDecimal taxRate = business.getTaxRate() != null ? business.getTaxRate() : BigDecimal.ZERO;
        boolean taxInclusive = business.isTaxInclusive();
        BigDecimal taxAmount = BigDecimal.ZERO;
        BigDecimal finalTotal;

        if (taxRate.compareTo(BigDecimal.ZERO) > 0) {
            if (taxInclusive) {
                // Formula: Tax = Net - (Net / (1 + Rate / 100))
                BigDecimal divisor = BigDecimal.ONE.add(taxRate.divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP));
                BigDecimal baseWithoutTax = netAmount.divide(divisor, 2, RoundingMode.HALF_UP);
                taxAmount = netAmount.subtract(baseWithoutTax);
                finalTotal = netAmount;
            } else {
                // Formula: Tax = Net * (Rate / 100)
                taxAmount = netAmount.multiply(taxRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                finalTotal = netAmount.add(taxAmount);
            }
        } else {
            finalTotal = netAmount;
        }

        // 4. Generate unique invoice number
        String invoiceNumber = generateInvoiceNumber(businessId);

        PaymentStatus paymentStatus = Boolean.TRUE.equals(request.getMarkAsPaid())
                ? PaymentStatus.COMPLETED
                : PaymentStatus.PENDING;

        // 5. Persist order
        Order order = Order.builder()
                .business(business)
                .customer(customer)
                .invoiceNumber(invoiceNumber)
                .subtotal(subtotal)
                .discount(discountAmount)
                .tax(taxAmount)
                .total(finalTotal)
                .paymentStatus(paymentStatus)
                .orderStatus(OrderStatus.COMPLETED)
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.CASH)
                .createdBy(creatorName)
                .createdByUserId(creatorUserId)
                .notes(request.getNotes())
                .build();

        for (OrderItem item : orderItems) {
            order.addItem(item);
        }

        Order savedOrder = orderRepository.save(order);

        // 6. Reduce inventory where inventory tracking is enabled
        if (business.isInventoryEnabled()) {
            for (OrderItem item : savedOrder.getItems()) {
                Product product = item.getProduct();
                if (product != null && product.isTrackStock()) {
                    int qtyPurchased = item.getQuantity() != null ? item.getQuantity().intValue() : 1;
                    int prevStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                    int newStock = prevStock - qtyPurchased;
                    product.setStockQuantity(newStock);
                    productRepository.save(product);

                    StockMovement movement = StockMovement.builder()
                            .business(business)
                            .product(product)
                            .movementType(MovementType.SALE)
                            .quantity(-qtyPurchased)
                            .previousStock(prevStock)
                            .newStock(newStock)
                            .referenceType(ReferenceType.ORDER)
                            .referenceId(savedOrder.getId())
                            .referenceNumber(savedOrder.getInvoiceNumber())
                            .notes("Sale checkout invoice " + savedOrder.getInvoiceNumber())
                            .createdBy(creatorName)
                            .build();

                    stockMovementRepository.save(movement);
                }
            }
        }

        // 7. Record payment if marked as paid
        List<Payment> payments = new ArrayList<>();
        if (Boolean.TRUE.equals(request.getMarkAsPaid())) {
            Payment payment = Payment.builder()
                    .business(business)
                    .orderId(savedOrder.getId())
                    .amount(finalTotal)
                    .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.CASH)
                    .paymentStatus(PaymentStatus.COMPLETED)
                    .transactionReference(request.getTransactionReference())
                    .notes(request.getNotes())
                    .build();

            Payment savedPayment = paymentRepository.save(payment);
            payments.add(savedPayment);
        }

        return OrderResponse.fromEntity(savedOrder, payments);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getOrders(String search,
                                                PaymentStatus paymentStatus,
                                                OrderStatus orderStatus,
                                                PaymentMethod paymentMethod,
                                                LocalDate startDate,
                                                LocalDate endDate,
                                                int page,
                                                int size,
                                                String sort) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<Order> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("business").get("id"), businessId));

            if (paymentStatus != null) {
                predicates.add(cb.equal(root.get("paymentStatus"), paymentStatus));
            }
            if (orderStatus != null) {
                predicates.add(cb.equal(root.get("orderStatus"), orderStatus));
            }
            if (paymentMethod != null) {
                predicates.add(cb.equal(root.get("paymentMethod"), paymentMethod));
            }
            if (startDate != null) {
                Instant startInstant = startDate.atStartOfDay(ZoneOffset.UTC).toInstant();
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startInstant));
            }
            if (endDate != null) {
                Instant endInstant = endDate.atTime(LocalTime.MAX).atZone(ZoneOffset.UTC).toInstant();
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endInstant));
            }
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate invoiceMatch = cb.like(cb.lower(root.get("invoiceNumber")), pattern);
                Predicate customerNameMatch = cb.like(cb.lower(root.join("customer", jakarta.persistence.criteria.JoinType.LEFT).get("name")), pattern);
                predicates.add(cb.or(invoiceMatch, customerNameMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Order> orderPage = orderRepository.findAll(spec, pageable);

        List<OrderResponse> content = orderPage.getContent().stream()
                .map(order -> {
                    List<Payment> payments = paymentRepository.findByOrderId(order.getId());
                    return OrderResponse.fromEntity(order, payments);
                })
                .collect(Collectors.toList());

        return PageResponse.<OrderResponse>builder()
                .content(content)
                .pageNumber(orderPage.getNumber())
                .pageSize(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .isFirst(orderPage.isFirst())
                .isLast(orderPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Order order = orderRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        List<Payment> payments = paymentRepository.findByOrderId(order.getId());
        return OrderResponse.fromEntity(order, payments);
    }

    @Transactional
    public OrderResponse cancelOrder(Long id, CancelOrderRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Order order = orderRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Order is already cancelled.");
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        order.setPaymentStatus(PaymentStatus.CANCELLED);
        if (request != null && request.getReason() != null && !request.getReason().trim().isEmpty()) {
            String notePrefix = order.getNotes() != null ? order.getNotes() + " | " : "";
            order.setNotes(notePrefix + "Cancelled: " + request.getReason().trim());
        }

        Order savedOrder = orderRepository.save(order);

        // Restore stock if inventory tracking is enabled
        if (order.getBusiness() != null && order.getBusiness().isInventoryEnabled()) {
            String canceller = SecurityUtils.getCurrentUserPrincipal().getFullName();
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                if (product != null && product.isTrackStock()) {
                    int qtyPurchased = item.getQuantity() != null ? item.getQuantity().intValue() : 1;
                    int prevStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                    int newStock = prevStock + qtyPurchased;
                    product.setStockQuantity(newStock);
                    productRepository.save(product);

                    StockMovement movement = StockMovement.builder()
                            .business(order.getBusiness())
                            .product(product)
                            .movementType(MovementType.RETURN)
                            .quantity(qtyPurchased)
                            .previousStock(prevStock)
                            .newStock(newStock)
                            .referenceType(ReferenceType.ORDER)
                            .referenceId(order.getId())
                            .referenceNumber(order.getInvoiceNumber())
                            .notes("Order cancellation stock restocking")
                            .createdBy(canceller)
                            .build();

                    stockMovementRepository.save(movement);
                }
            }
        }

        List<Payment> payments = paymentRepository.findByOrderId(id);
        for (Payment payment : payments) {
            payment.setPaymentStatus(PaymentStatus.CANCELLED);
            paymentRepository.save(payment);
        }

        return OrderResponse.fromEntity(savedOrder, payments);
    }

    @Transactional(readOnly = true)
    public BillingSummaryResponse getDashboardSummary() {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", "id", businessId));

        ZoneId zoneId;
        try {
            zoneId = ZoneId.of(business.getTimezone() != null ? business.getTimezone() : "UTC");
        } catch (Exception e) {
            zoneId = ZoneOffset.UTC;
        }

        LocalDate today = LocalDate.now(zoneId);
        Instant startOfDay = today.atStartOfDay(zoneId).toInstant();
        Instant endOfDay = today.atTime(LocalTime.MAX).atZone(zoneId).toInstant();

        LocalDate firstDayOfMonth = today.withDayOfMonth(1);
        LocalDate lastDayOfMonth = today.withDayOfMonth(today.lengthOfMonth());
        Instant startOfMonth = firstDayOfMonth.atStartOfDay(zoneId).toInstant();
        Instant endOfMonth = lastDayOfMonth.atTime(LocalTime.MAX).atZone(zoneId).toInstant();

        BigDecimal todaySales = orderRepository.sumSalesForDateRange(
                businessId, startOfDay, endOfDay, PaymentStatus.COMPLETED, OrderStatus.COMPLETED);
        todaySales = todaySales != null ? todaySales : BigDecimal.ZERO;

        BigDecimal monthSales = orderRepository.sumSalesForDateRange(
                businessId, startOfMonth, endOfMonth, PaymentStatus.COMPLETED, OrderStatus.COMPLETED);
        monthSales = monthSales != null ? monthSales : BigDecimal.ZERO;

        BigDecimal todayExpenses = expenseRepository.sumExpensesForDate(businessId, today);
        todayExpenses = todayExpenses != null ? todayExpenses : BigDecimal.ZERO;

        BigDecimal monthExpenses = expenseRepository.sumExpensesForDateRange(businessId, firstDayOfMonth, lastDayOfMonth);
        monthExpenses = monthExpenses != null ? monthExpenses : BigDecimal.ZERO;

        BigDecimal todayNetRevenue = todaySales.subtract(todayExpenses);
        BigDecimal monthNetRevenue = monthSales.subtract(monthExpenses);

        long todayOrdersCount = orderRepository.countOrdersForDateRange(
                businessId, startOfDay, endOfDay, OrderStatus.COMPLETED);

        BigDecimal pendingDueAmount = orderRepository.sumPendingDueAmount(businessId);
        long totalCustomersCount = customerRepository.countByBusinessId(businessId);

        List<Order> recentOrdersList = orderRepository.findRecentOrders(
                businessId, PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt")));

        List<OrderResponse> recentOrders = recentOrdersList.stream()
                .map(o -> OrderResponse.fromEntity(o, paymentRepository.findByOrderId(o.getId())))
                .collect(Collectors.toList());

        return BillingSummaryResponse.builder()
                .todaySales(todaySales)
                .monthSales(monthSales)
                .todayExpenses(todayExpenses)
                .monthExpenses(monthExpenses)
                .todayNetRevenue(todayNetRevenue)
                .monthNetRevenue(monthNetRevenue)
                .todayOrdersCount(todayOrdersCount)
                .pendingDueAmount(pendingDueAmount != null ? pendingDueAmount : BigDecimal.ZERO)
                .totalCustomersCount(totalCustomersCount)
                .currency(business.getCurrency() != null ? business.getCurrency() : "INR")
                .recentOrders(recentOrders)
                .build();
    }

    private String generateInvoiceNumber(Long businessId) {
        String datePart = DateTimeFormatter.ofPattern("yyyyMMdd").format(LocalDate.now());
        for (int attempt = 0; attempt < 5; attempt++) {
            int randomSuffix = 1000 + RANDOM.nextInt(9000);
            String candidate = "INV-" + datePart + "-" + randomSuffix;
            if (!orderRepository.existsByBusinessIdAndInvoiceNumber(businessId, candidate)) {
                return candidate;
            }
        }
        return "INV-" + datePart + "-" + System.currentTimeMillis() % 100000;
    }
}
