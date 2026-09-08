package com.bizflow.billing.dto;

import com.bizflow.billing.Order;
import com.bizflow.billing.OrderStatus;
import com.bizflow.customer.dto.CustomerResponse;
import com.bizflow.payment.Payment;
import com.bizflow.payment.PaymentMethod;
import com.bizflow.payment.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private Long id;
    private Long businessId;
    private String businessName;
    private String currency;
    private CustomerResponse customer;
    private String invoiceNumber;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal tax;
    private BigDecimal taxRate;
    private String taxName;
    private Boolean taxInclusive;
    private BigDecimal total;
    private PaymentStatus paymentStatus;
    private OrderStatus orderStatus;
    private PaymentMethod paymentMethod;
    private String createdBy;
    private String notes;
    private List<OrderItemResponse> items;
    private List<PaymentResponse> payments;
    private Instant createdAt;
    private Instant updatedAt;

    public static OrderResponse fromEntity(Order order) {
        return fromEntity(order, Collections.emptyList());
    }

    public static OrderResponse fromEntity(Order order, List<Payment> payments) {
        if (order == null) {
            return null;
        }

        List<OrderItemResponse> itemResponses = order.getItems() != null
                ? order.getItems().stream().map(OrderItemResponse::fromEntity).collect(Collectors.toList())
                : new ArrayList<>();

        List<PaymentResponse> paymentResponses = payments != null
                ? payments.stream().map(PaymentResponse::fromEntity).collect(Collectors.toList())
                : new ArrayList<>();

        CustomerResponse customerResponse = order.getCustomer() != null
                ? CustomerResponse.fromEntity(order.getCustomer())
                : null;

        String businessName = order.getBusiness() != null ? order.getBusiness().getName() : null;
        String currency = order.getBusiness() != null ? order.getBusiness().getCurrency() : "INR";
        BigDecimal taxRate = order.getBusiness() != null ? order.getBusiness().getTaxRate() : BigDecimal.ZERO;
        String taxName = order.getBusiness() != null ? order.getBusiness().getTaxName() : "Tax";
        Boolean taxInclusive = order.getBusiness() != null ? order.getBusiness().isTaxInclusive() : false;

        return OrderResponse.builder()
                .id(order.getId())
                .businessId(order.getBusinessId())
                .businessName(businessName)
                .currency(currency)
                .customer(customerResponse)
                .invoiceNumber(order.getInvoiceNumber())
                .subtotal(order.getSubtotal())
                .discount(order.getDiscount())
                .tax(order.getTax())
                .taxRate(taxRate)
                .taxName(taxName)
                .taxInclusive(taxInclusive)
                .total(order.getTotal())
                .paymentStatus(order.getPaymentStatus())
                .orderStatus(order.getOrderStatus())
                .paymentMethod(order.getPaymentMethod())
                .createdBy(order.getCreatedBy())
                .notes(order.getNotes())
                .items(itemResponses)
                .payments(paymentResponses)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
