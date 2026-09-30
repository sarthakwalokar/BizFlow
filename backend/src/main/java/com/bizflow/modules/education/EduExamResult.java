package com.bizflow.modules.education;

import com.bizflow.business.Business;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "edu_exam_results")
public class EduExamResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private EduBatch batch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private EduStudent student;

    @Column(name = "exam_name", nullable = false, length = 150)
    private String examName;

    @Column(name = "subject", nullable = false, length = 100)
    private String subject;

    @Column(name = "exam_date", nullable = false)
    private LocalDate examDate;

    @Column(name = "max_marks", nullable = false)
    private BigDecimal maxMarks;

    @Column(name = "marks_obtained", nullable = false)
    private BigDecimal marksObtained;

    @Column(name = "grade", length = 10)
    private String grade;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
