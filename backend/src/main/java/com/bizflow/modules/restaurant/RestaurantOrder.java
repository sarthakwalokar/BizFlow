package com.bizflow.modules.restaurant;

import com.bizflow.business.Business;
import com.bizflow.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "restaurant_orders")
public class RestaurantOrder extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_id")
    private RestaurantTable table;

    @Column(name = "order_number", nullable = false, length = 100)
    private String orderNumber;

    @Column(name = "order_type", nullable = false, length = 30)
    private String orderType; // DINE_IN, TAKEAWAY

    @Column(name = "customer_name", length = 150)
    private String customerName;

    @Column(name = "customer_phone", length = 50)
    private String customerPhone;

    @Column(name = "customer_email", length = 150)
    private String customerEmail;

    @Column(name = "customer_address", columnDefinition = "TEXT")
    private String customerAddress;

    @Column(name = "status", nullable = false, length = 30)
    private String status; // ORDERED, PREPARING, READY, SERVED, COMPLETED, CANCELLED

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "core_order_id")
    private Long coreOrderId;

    @Builder.Default
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RestaurantOrderItem> items = new ArrayList<>();
}
