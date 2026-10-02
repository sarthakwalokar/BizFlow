package com.bizflow.modules.education;

import com.bizflow.business.Business;
import com.bizflow.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "edu_students")
public class EduStudent extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "student_id_number", nullable = false, length = 100)
    private String studentIdNumber;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "parent_name", length = 150)
    private String parentName;

    @Column(name = "parent_phone", length = 50)
    private String parentPhone;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "admission_date", nullable = false)
    private LocalDate admissionDate;

    @Column(name = "status", nullable = false, length = 30)
    private String status; // ACTIVE, INACTIVE, COMPLETED, DROPPED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_batch_id")
    private EduBatch currentBatch;
}
