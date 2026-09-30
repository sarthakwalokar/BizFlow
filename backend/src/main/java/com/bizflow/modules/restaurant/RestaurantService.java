package com.bizflow.modules.restaurant;

import com.bizflow.billing.Order;
import com.bizflow.billing.OrderItem;
import com.bizflow.billing.OrderItemRepository;
import com.bizflow.billing.OrderRepository;
import com.bizflow.billing.OrderStatus;
import com.bizflow.business.Business;
import com.bizflow.business.BusinessRepository;
import com.bizflow.common.exception.ResourceNotFoundException;
import com.bizflow.customer.Customer;
import com.bizflow.customer.CustomerRepository;
import com.bizflow.modules.restaurant.RestaurantDtos.*;
import com.bizflow.payment.Payment;
import com.bizflow.payment.PaymentMethod;
import com.bizflow.payment.PaymentRepository;
import com.bizflow.payment.PaymentStatus;
import com.bizflow.product.ProductType;
import com.bizflow.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantTableRepository tableRepository;
    private final RestaurantOrderRepository orderRepository;
    private final RestaurantKotRepository kotRepository;
    private final BusinessRepository businessRepository;
    private final OrderRepository coreOrderRepository;
    private final OrderItemRepository coreOrderItemRepository;
    private final PaymentRepository corePaymentRepository;
    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public List<TableResponse> getTables() {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        List<RestaurantTable> tables = tableRepository.findByBusinessIdOrderByTableNumberAsc(businessId);
        return tables.stream().map(this::mapTableToResponse).collect(Collectors.toList());
    }

    @Transactional
    public TableResponse createTable(TableRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        RestaurantTable table = RestaurantTable.builder()
                .business(business)
                .tableNumber(request.getTableNumber().trim())
                .name(request.getName() != null ? request.getName().trim() : "Table " + request.getTableNumber())
                .capacity(request.getCapacity() != null ? request.getCapacity() : 4)
                .sectionFloor(request.getSectionFloor() != null ? request.getSectionFloor().trim() : "Main Dining")
                .status("AVAILABLE")
                .build();

        return mapTableToResponse(tableRepository.save(table));
    }

    @Transactional
    public TableResponse updateTable(Long id, TableRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        RestaurantTable table = tableRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        if (request.getTableNumber() != null) table.setTableNumber(request.getTableNumber().trim());
        if (request.getName() != null) table.setName(request.getName().trim());
        if (request.getCapacity() != null) table.setCapacity(request.getCapacity());
        if (request.getSectionFloor() != null) table.setSectionFloor(request.getSectionFloor().trim());
        if (request.getStatus() != null) table.setStatus(request.getStatus());

        return mapTableToResponse(tableRepository.save(table));
    }

    @Transactional
    public void deleteTable(Long id) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        RestaurantTable table = tableRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));
        tableRepository.delete(table);
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        RestaurantTable table = null;
        if (request.getTableId() != null) {
            table = tableRepository.findByIdAndBusinessId(request.getTableId(), businessId)
                    .orElse(null);
        }

        String orderNum = "ORD-" + System.currentTimeMillis() % 1000000;
        BigDecimal total = BigDecimal.ZERO;

        RestaurantOrder order = RestaurantOrder.builder()
                .business(business)
                .table(table)
                .orderNumber(orderNum)
                .orderType(request.getOrderType() != null ? request.getOrderType() : "DINE_IN")
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .status("ORDERED")
                .totalAmount(BigDecimal.ZERO)
                .notes(request.getNotes())
                .items(new ArrayList<>())
                .build();

        if (request.getItems() != null) {
            for (CreateOrderItemRequest itemReq : request.getItems()) {
                int qty = itemReq.getQuantity() != null ? itemReq.getQuantity() : 1;
                BigDecimal price = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : BigDecimal.ZERO;
                BigDecimal itemTotal = price.multiply(BigDecimal.valueOf(qty));
                total = total.add(itemTotal);

                RestaurantOrderItem item = RestaurantOrderItem.builder()
                        .order(order)
                        .itemName(itemReq.getItemName())
                        .quantity(qty)
                        .unitPrice(price)
                        .totalPrice(itemTotal)
                        .notes(itemReq.getNotes())
                        .kotStatus("PENDING")
                        .build();

                order.getItems().add(item);
            }
        }

        order.setTotalAmount(total);
        RestaurantOrder savedOrder = orderRepository.save(order);

        // Generate KOT Ticket
        String kotNum = "KOT-" + System.currentTimeMillis() % 10000;
        RestaurantKotTicket kot = RestaurantKotTicket.builder()
                .business(business)
                .orderId(savedOrder.getId())
                .kotNumber(kotNum)
                .tableName(table != null ? (table.getName() != null ? table.getName() : "Table " + table.getTableNumber()) : "Takeaway")
                .status("PENDING")
                .notes(request.getNotes())
                .build();
        kotRepository.save(kot);

        // If Dine-in, mark table as OCCUPIED and link active order
        if (table != null) {
            table.setStatus("OCCUPIED");
            table.setActiveOrderId(savedOrder.getId());
            tableRepository.save(table);
        }

        return mapOrderToResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrders(String status) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        List<RestaurantOrder> orders;
        if (status != null && !status.isEmpty()) {
            orders = orderRepository.findByBusinessIdAndStatusInOrderByCreatedAtDesc(businessId, List.of(status.split(",")));
        } else {
            orders = orderRepository.findByBusinessIdOrderByCreatedAtDesc(businessId);
        }
        return orders.stream().map(this::mapOrderToResponse).collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String newStatus) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        RestaurantOrder order = orderRepository.findByIdAndBusinessId(orderId, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        order.setStatus(newStatus);

        if ("COMPLETED".equalsIgnoreCase(newStatus)) {
            if (order.getCoreOrderId() == null) {
                Order coreOrder = recordCoreOrderAndPayment(order, order.getTable(), "CASH", null);
                if (coreOrder != null) {
                    order.setCoreOrderId(coreOrder.getId());
                }
            }
            if (order.getTable() != null) {
                RestaurantTable table = order.getTable();
                table.setStatus("AVAILABLE");
                table.setActiveOrderId(null);
                tableRepository.save(table);
            }
        } else if ("CANCELLED".equalsIgnoreCase(newStatus)) {
            if (order.getTable() != null) {
                RestaurantTable table = order.getTable();
                table.setStatus("AVAILABLE");
                table.setActiveOrderId(null);
                tableRepository.save(table);
            }
        }

        RestaurantOrder saved = orderRepository.save(order);
        return mapOrderToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<KotTicketResponse> getKotTickets() {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        List<RestaurantKotTicket> kots = kotRepository.findByBusinessIdOrderByCreatedAtDesc(businessId);
        return kots.stream().map(k -> {
            List<OrderItemDto> itemDtos = new ArrayList<>();
            orderRepository.findById(k.getOrderId()).ifPresent(ord -> {
                itemDtos.addAll(ord.getItems().stream().map(this::mapOrderItemToDto).collect(Collectors.toList()));
            });

            return KotTicketResponse.builder()
                    .id(k.getId())
                    .orderId(k.getOrderId())
                    .kotNumber(k.getKotNumber())
                    .tableName(k.getTableName())
                    .status(k.getStatus())
                    .notes(k.getNotes())
                    .items(itemDtos)
                    .createdAt(k.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public KotTicketResponse updateKotStatus(Long kotId, String newStatus) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        RestaurantKotTicket kot = kotRepository.findByIdAndBusinessId(kotId, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("KOT ticket not found"));

        kot.setStatus(newStatus);
        RestaurantKotTicket saved = kotRepository.save(kot);

        // Update items KOT status as well
        orderRepository.findById(saved.getOrderId()).ifPresent(ord -> {
            for (RestaurantOrderItem item : ord.getItems()) {
                item.setKotStatus(newStatus);
            }
            if ("READY".equalsIgnoreCase(newStatus)) {
                ord.setStatus("READY");
            } else if ("PREPARING".equalsIgnoreCase(newStatus)) {
                ord.setStatus("PREPARING");
            }
            orderRepository.save(ord);
        });

        List<OrderItemDto> itemDtos = new ArrayList<>();
        orderRepository.findById(saved.getOrderId()).ifPresent(ord -> {
            itemDtos.addAll(ord.getItems().stream().map(this::mapOrderItemToDto).collect(Collectors.toList()));
        });

        return KotTicketResponse.builder()
                .id(saved.getId())
                .orderId(saved.getOrderId())
                .kotNumber(saved.getKotNumber())
                .tableName(saved.getTableName())
                .status(saved.getStatus())
                .notes(saved.getNotes())
                .items(itemDtos)
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Transactional
    public TableResponse reserveTable(Long id, ReserveTableRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        RestaurantTable table = tableRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        if (request.getCustomerName() == null || request.getCustomerName().trim().isEmpty()) {
            throw new IllegalArgumentException("Customer name is required for table reservation");
        }

        table.setStatus("RESERVED");
        table.setReservationCustomerName(request.getCustomerName().trim());
        table.setReservationCustomerPhone(request.getCustomerPhone() != null ? request.getCustomerPhone().trim() : null);
        table.setReservationNotes(request.getNotes() != null ? request.getNotes().trim() : null);
        table.setReservationTime(request.getReservationTime() != null ? request.getReservationTime().trim() : null);

        return mapTableToResponse(tableRepository.save(table));
    }

    @Transactional
    public TableResponse cancelReservation(Long id) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        RestaurantTable table = tableRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        table.setStatus("AVAILABLE");
        table.setReservationCustomerName(null);
        table.setReservationCustomerPhone(null);
        table.setReservationNotes(null);
        table.setReservationTime(null);

        return mapTableToResponse(tableRepository.save(table));
    }

    @Transactional
    public void deleteOrder(Long orderId) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        RestaurantOrder order = orderRepository.findByIdAndBusinessId(orderId, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Protect finalized billing data
        if ("COMPLETED".equalsIgnoreCase(order.getStatus())) {
            throw new IllegalStateException("Cannot delete a completed/settled order. Finalized financial records are protected.");
        }

        // If active on table, reset table to available
        if (order.getTable() != null) {
            RestaurantTable table = order.getTable();
            if (order.getId().equals(table.getActiveOrderId())) {
                table.setActiveOrderId(null);
                if ("OCCUPIED".equalsIgnoreCase(table.getStatus())) {
                    table.setStatus("AVAILABLE");
                }
                tableRepository.save(table);
            }
        }

        // Delete associated KOT tickets
        kotRepository.deleteByOrderId(order.getId());

        // Delete order (cascades to order items)
        orderRepository.delete(order);
    }

    @Transactional
    public void deleteKotTicket(Long kotId) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        RestaurantKotTicket kot = kotRepository.findByIdAndBusinessId(kotId, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("KOT ticket not found"));

        kotRepository.delete(kot);
    }

    @Transactional
    public TableResponse settleTableBill(Long tableId) {
        return settleTableBill(tableId, null);
    }

    @Transactional
    public TableResponse settleTableBill(Long tableId, SettleBillRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        RestaurantTable table = tableRepository.findByIdAndBusinessId(tableId, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        if (table.getActiveOrderId() != null) {
            orderRepository.findById(table.getActiveOrderId()).ifPresent(ord -> {
                ord.setStatus("COMPLETED");
                String method = (request != null && request.getPaymentMethod() != null) ? request.getPaymentMethod() : "CASH";
                String notes = request != null ? request.getNotes() : null;
                if (ord.getCoreOrderId() == null) {
                    Order coreOrder = recordCoreOrderAndPayment(ord, table, method, notes);
                    if (coreOrder != null) {
                        ord.setCoreOrderId(coreOrder.getId());
                    }
                }
                orderRepository.save(ord);
            });
        }

        table.setStatus("AVAILABLE");
        table.setActiveOrderId(null);
        table.setReservationCustomerName(null);
        table.setReservationCustomerPhone(null);
        table.setReservationNotes(null);
        table.setReservationTime(null);
        return mapTableToResponse(tableRepository.save(table));
    }

    @Transactional
    public OrderResponse settleOrder(Long orderId, SettleBillRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        RestaurantOrder order = orderRepository.findByIdAndBusinessId(orderId, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        order.setStatus("COMPLETED");
        String method = (request != null && request.getPaymentMethod() != null) ? request.getPaymentMethod() : "CASH";
        String notes = request != null ? request.getNotes() : null;
        if (order.getCoreOrderId() == null) {
            Order coreOrder = recordCoreOrderAndPayment(order, order.getTable(), method, notes);
            if (coreOrder != null) {
                order.setCoreOrderId(coreOrder.getId());
            }
        }

        if (order.getTable() != null) {
            RestaurantTable table = order.getTable();
            if (order.getId().equals(table.getActiveOrderId())) {
                table.setStatus("AVAILABLE");
                table.setActiveOrderId(null);
                tableRepository.save(table);
            }
        }

        return mapOrderToResponse(orderRepository.save(order));
    }

    private Order recordCoreOrderAndPayment(RestaurantOrder restOrder, RestaurantTable table, String paymentMethodStr, String notes) {
        if (restOrder.getCoreOrderId() != null) {
            return coreOrderRepository.findById(restOrder.getCoreOrderId()).orElse(null);
        }

        Business business = restOrder.getBusiness();
        String invoiceNum = "INV-REST-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + (restOrder.getId() % 100000);

        PaymentMethod payMethod = PaymentMethod.CASH;
        if (paymentMethodStr != null) {
            try {
                payMethod = PaymentMethod.valueOf(paymentMethodStr.toUpperCase().trim());
            } catch (Exception ignored) {}
        }

        Customer customer = null;
        String custPhone = (restOrder.getCustomerPhone() != null && !restOrder.getCustomerPhone().trim().isEmpty()) ? restOrder.getCustomerPhone().trim() : null;
        String custName = (restOrder.getCustomerName() != null && !restOrder.getCustomerName().trim().isEmpty()) ? restOrder.getCustomerName().trim() : null;

        if (custPhone != null) {
            customer = customerRepository.findByBusinessIdAndPhone(business.getId(), custPhone).orElse(null);
        }
        if (customer == null && (custName != null || custPhone != null)) {
            customer = Customer.builder()
                    .business(business)
                    .name(custName != null ? custName : ("Customer " + (custPhone != null ? custPhone : "")))
                    .phone(custPhone)
                    .build();
            customer = customerRepository.save(customer);
        }

        String creatorName = "Restaurant POS";
        Long creatorUserId = null;
        try {
            if (SecurityUtils.getCurrentUserPrincipal() != null) {
                creatorName = SecurityUtils.getCurrentUserPrincipal().getFullName();
                creatorUserId = SecurityUtils.getCurrentUserId();
            }
        } catch (Exception ignored) {}

        String tableNote = table != null ? ("Table: " + (table.getName() != null ? table.getName() : table.getTableNumber()) + " | ") : "Takeaway | ";
        String combinedNotes = tableNote + (notes != null ? notes : (restOrder.getNotes() != null ? restOrder.getNotes() : ""));

        Order coreOrder = Order.builder()
                .business(business)
                .customer(customer)
                .invoiceNumber(invoiceNum)
                .subtotal(restOrder.getTotalAmount() != null ? restOrder.getTotalAmount() : BigDecimal.ZERO)
                .discount(BigDecimal.ZERO)
                .tax(BigDecimal.ZERO)
                .total(restOrder.getTotalAmount() != null ? restOrder.getTotalAmount() : BigDecimal.ZERO)
                .paymentStatus(PaymentStatus.COMPLETED)
                .orderStatus(OrderStatus.COMPLETED)
                .paymentMethod(payMethod)
                .createdBy(creatorName)
                .createdByUserId(creatorUserId)
                .notes(combinedNotes)
                .items(new ArrayList<>())
                .build();

        if (restOrder.getItems() != null) {
            for (RestaurantOrderItem rItem : restOrder.getItems()) {
                OrderItem cItem = OrderItem.builder()
                        .order(coreOrder)
                        .product(rItem.getProduct())
                        .productNameSnapshot(rItem.getItemName())
                        .productType(ProductType.PHYSICAL)
                        .quantity(BigDecimal.valueOf(rItem.getQuantity()))
                        .unitPrice(rItem.getUnitPrice() != null ? rItem.getUnitPrice() : BigDecimal.ZERO)
                        .total(rItem.getTotalPrice() != null ? rItem.getTotalPrice() : BigDecimal.ZERO)
                        .build();
                coreOrder.addItem(cItem);
            }
        }

        Order savedCoreOrder = coreOrderRepository.save(coreOrder);

        // Record core payment
        Payment payment = Payment.builder()
                .business(business)
                .orderId(savedCoreOrder.getId())
                .amount(savedCoreOrder.getTotal())
                .paymentMethod(payMethod)
                .paymentStatus(PaymentStatus.COMPLETED)
                .transactionReference("REST-" + restOrder.getOrderNumber())
                .notes("Restaurant " + (table != null ? "Dine-in (" + table.getTableNumber() + ")" : "Takeaway") + " Settlement")
                .build();
        corePaymentRepository.save(payment);

        return savedCoreOrder;
    }

    private TableResponse mapTableToResponse(RestaurantTable table) {
        OrderResponse activeOrder = null;
        if (table.getActiveOrderId() != null) {
            activeOrder = orderRepository.findById(table.getActiveOrderId())
                    .map(this::mapOrderToResponse)
                    .orElse(null);
        }

        return TableResponse.builder()
                .id(table.getId())
                .tableNumber(table.getTableNumber())
                .name(table.getName())
                .capacity(table.getCapacity())
                .sectionFloor(table.getSectionFloor())
                .status(table.getStatus())
                .activeOrderId(table.getActiveOrderId())
                .activeOrder(activeOrder)
                .reservationCustomerName(table.getReservationCustomerName())
                .reservationCustomerPhone(table.getReservationCustomerPhone())
                .reservationNotes(table.getReservationNotes())
                .reservationTime(table.getReservationTime())
                .createdAt(table.getCreatedAt())
                .build();
    }

    private OrderResponse mapOrderToResponse(RestaurantOrder order) {
        List<OrderItemDto> itemDtos = order.getItems() != null
                ? order.getItems().stream().map(this::mapOrderItemToDto).collect(Collectors.toList())
                : new ArrayList<>();

        String coreInvoiceNum = null;
        if (order.getCoreOrderId() != null) {
            coreInvoiceNum = coreOrderRepository.findById(order.getCoreOrderId())
                    .map(Order::getInvoiceNumber)
                    .orElse(null);
        }

        return OrderResponse.builder()
                .id(order.getId())
                .tableId(order.getTable() != null ? order.getTable().getId() : null)
                .tableName(order.getTable() != null ? order.getTable().getName() : "Takeaway")
                .orderNumber(order.getOrderNumber())
                .orderType(order.getOrderType())
                .customerName(order.getCustomerName())
                .customerPhone(order.getCustomerPhone())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .notes(order.getNotes())
                .coreOrderId(order.getCoreOrderId())
                .coreInvoiceNumber(coreInvoiceNum)
                .items(itemDtos)
                .createdAt(order.getCreatedAt())
                .build();
    }

    private OrderItemDto mapOrderItemToDto(RestaurantOrderItem item) {
        return OrderItemDto.builder()
                .id(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .itemName(item.getItemName())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .notes(item.getNotes())
                .kotStatus(item.getKotStatus())
                .build();
    }
}
