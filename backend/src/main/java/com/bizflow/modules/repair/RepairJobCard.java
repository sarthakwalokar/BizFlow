package com.bizflow.modules.repair;

import com.bizflow.business.Business;
import com.bizflow.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "repair_job_cards")
public class RepairJobCard extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(name = "job_card_number", nullable = false, length = 100)
    private String jobCardNumber;

    @Column(name = "customer_name", nullable = false, length = 150)
    private String customerName;

    @Column(name = "customer_phone", nullable = false, length = 50)
    private String customerPhone;

    @Column(name = "customer_email", length = 150)
    private String customerEmail;

    @Column(name = "item_type", nullable = false, length = 100)
    private String itemType;

    @Column(name = "brand", length = 100)
    private String brand;

    @Column(name = "model", length = 100)
    private String model;

    @Column(name = "serial_or_imei", length = 100)
    private String serialOrImei;

    @Column(name = "problem_description", nullable = false, columnDefinition = "TEXT")
    private String problemDescription;

    @Column(name = "diagnostic_notes", columnDefinition = "TEXT")
    private String diagnosticNotes;

    @Column(name = "work_performed", columnDefinition = "TEXT")
    private String workPerformed;

    @Column(name = "parts_cost", nullable = false)
    private BigDecimal partsCost;

    @Column(name = "labour_cost", nullable = false)
    private BigDecimal labourCost;

    @Column(name = "total_estimated_cost", nullable = false)
    private BigDecimal totalEstimatedCost;

    @Column(name = "total_final_cost", nullable = false)
    private BigDecimal totalFinalCost;

    @Column(name = "assigned_technician", length = 150)
    private String assignedTechnician;

    @Column(name = "status", nullable = false, length = 30)
    private String status; // RECEIVED, DIAGNOSING, REPAIRING, READY, DELIVERED, CANCELLED

    @Column(name = "priority", nullable = false, length = 30)
    private String priority; // LOW, NORMAL, HIGH, URGENT

    @Column(name = "estimated_completion_date")
    private LocalDate estimatedCompletionDate;

    @Column(name = "delivery_date")
    private Instant deliveryDate;

    @Column(name = "payment_status", nullable = false, length = 30)
    private String paymentStatus; // PENDING, PAID
}
