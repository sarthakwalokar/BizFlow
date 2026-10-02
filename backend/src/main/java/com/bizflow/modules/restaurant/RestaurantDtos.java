package com.bizflow.modules.restaurant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class RestaurantDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TableResponse {
        private Long id;
        private String tableNumber;
        private String name;
        private Integer capacity;
        private String sectionFloor;
        private String status;
        private Long activeOrderId;
        private OrderResponse activeOrder;
        private String reservationCustomerName;
        private String reservationCustomerPhone;
        private String reservationNotes;
        private String reservationTime;
        private Instant createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TableRequest {
        private String tableNumber;
        private String name;
        private Integer capacity;
        private String sectionFloor;
        private String status;
        private String reservationCustomerName;
        private String reservationCustomerPhone;
        private String reservationNotes;
        private String reservationTime;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReserveTableRequest {
        private String customerName;
        private String customerPhone;
        private String notes;
        private String reservationTime;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderResponse {
        private Long id;
        private Long tableId;
        private String tableName;
        private String orderNumber;
        private String orderType;
        private String customerName;
        private String customerPhone;
        private String customerEmail;
        private String customerAddress;
        private String status;
        private BigDecimal totalAmount;
        private String notes;
        private Long coreOrderId;
        private String coreInvoiceNumber;
        private List<OrderItemDto> items;
        private Instant createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SettleBillRequest {
        private String paymentMethod;
        private BigDecimal amountPaid;
        private String notes;
        private String customerName;
        private String customerPhone;
        private String customerEmail;
        private String customerAddress;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDto {
        private Long id;
        private Long productId;
        private String itemName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
        private String notes;
        private String kotStatus;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateOrderRequest {
        private Long tableId;
        private String orderType; // DINE_IN, TAKEAWAY
        private String customerName;
        private String customerPhone;
        private String customerEmail;
        private String customerAddress;
        private String notes;
        private List<CreateOrderItemRequest> items;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateOrderItemRequest {
        private Long productId;
        private String itemName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KotTicketResponse {
        private Long id;
        private Long orderId;
        private String kotNumber;
        private String tableName;
        private String status;
        private String notes;
        private List<OrderItemDto> items;
        private Instant createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateStatusRequest {
        private String status;
    }
}
