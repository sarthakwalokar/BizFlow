package com.bizflow.modules.education;

import com.bizflow.business.Business;
import com.bizflow.common.entity.BaseEntity;
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
@Table(name = "edu_enrollments")
public class EduEnrollment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private EduStudent student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private EduBatch batch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private EduCourse course;

    @Column(name = "enrollment_date", nullable = false)
    private LocalDate enrollmentDate;

    @Column(name = "total_fees", nullable = false)
    private BigDecimal totalFees;

    @Column(name = "discount", nullable = false)
    private BigDecimal discount;

    @Column(name = "net_fees", nullable = false)
    private BigDecimal netFees;

    @Column(name = "paid_amount", nullable = false)
    private BigDecimal paidAmount;

    @Column(name = "pending_amount", nullable = false)
    private BigDecimal pendingAmount;

    @Column(name = "next_due_date")
    private LocalDate nextDueDate;

    @Column(name = "payment_status", nullable = false, length = 30)
    private String paymentStatus; // PAID, PARTIAL, OVERDUE, PENDING
}
