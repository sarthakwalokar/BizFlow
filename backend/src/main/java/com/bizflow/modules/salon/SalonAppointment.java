package com.bizflow.modules.salon;

import com.bizflow.business.Business;
import com.bizflow.common.entity.BaseEntity;
import com.bizflow.customer.Customer;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "salon_appointments")
public class SalonAppointment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(name = "customer_name", nullable = false, length = 150)
    private String customerName;

    @Column(name = "customer_phone", length = 50)
    private String customerPhone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    private SalonServiceItem service;

    @Column(name = "service_name", nullable = false, length = 150)
    private String serviceName;

    @Column(name = "staff_name", length = 150)
    private String staffName;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "start_time", nullable = false, length = 20)
    private String startTime;

    @Column(name = "end_time", length = 20)
    private String endTime;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @Column(name = "status", nullable = false, length = 30)
    private String status; // BOOKED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
