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
@Table(name = "restaurant_kot_tickets")
public class RestaurantKotTicket extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "kot_number", nullable = false, length = 100)
    private String kotNumber;

    @Column(name = "table_name", length = 100)
    private String tableName;

    @Column(name = "status", nullable = false, length = 30)
    private String status; // PENDING, PREPARING, READY, SERVED

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
