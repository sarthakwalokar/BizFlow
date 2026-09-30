package com.bizflow.modules.restaurant;

import com.bizflow.business.Business;
import com.bizflow.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "restaurant_tables")
public class RestaurantTable extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(name = "table_number", nullable = false, length = 50)
    private String tableNumber;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    @Column(name = "section_floor", length = 100)
    private String sectionFloor;

    @Column(name = "status", nullable = false, length = 30)
    private String status; // AVAILABLE, OCCUPIED, RESERVED

    @Column(name = "active_order_id")
    private Long activeOrderId;

    @Column(name = "reservation_customer_name", length = 150)
    private String reservationCustomerName;

    @Column(name = "reservation_customer_phone", length = 50)
    private String reservationCustomerPhone;

    @Column(name = "reservation_notes", columnDefinition = "TEXT")
    private String reservationNotes;

    @Column(name = "reservation_time", length = 100)
    private String reservationTime;
}
