package com.bizflow.modules.education;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public class EducationDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseDto {
        private Long id;
        private String name;
        private String code;
        private String duration;
        private BigDecimal totalFees;
        private String description;
        private Boolean isActive;
        private Instant createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BatchDto {
        private Long id;
        private Long courseId;
        private String courseName;
        private String batchName;
        private String schedule;
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer capacity;
        private Integer enrolledCount;
        private Boolean isActive;
        private Instant createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentDto {
        private Long id;
        private String fullName;
        private String studentIdNumber;
        private String email;
        private String phone;
        private String parentName;
        private String parentPhone;
        private String address;
        private LocalDate admissionDate;
        private String status;
        private Long currentBatchId;
        private String currentBatchName;
        private Instant createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnrollmentDto {
        private Long id;
        private Long studentId;
        private String studentName;
        private String studentPhone;
        private Long batchId;
        private String batchName;
        private Long courseId;
        private String courseName;
        private LocalDate enrollmentDate;
        private BigDecimal totalFees;
        private BigDecimal discount;
        private BigDecimal netFees;
        private BigDecimal paidAmount;
        private BigDecimal pendingAmount;
        private LocalDate nextDueDate;
        private String paymentStatus;
        private Instant createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeePaymentDto {
        private Long id;
        private Long enrollmentId;
        private Long studentId;
        private String studentName;
        private String receiptNumber;
        private BigDecimal amount;
        private LocalDate paymentDate;
        private String paymentMethod;
        private String notes;
        private Instant createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceDto {
        private Long id;
        private Long batchId;
        private Long studentId;
        private String studentName;
        private LocalDate attendanceDate;
        private String status; // PRESENT, ABSENT, LATE, EXCUSED
        private String remarks;
        private Instant createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExamResultDto {
        private Long id;
        private Long batchId;
        private Long studentId;
        private String studentName;
        private String examName;
        private String subject;
        private LocalDate examDate;
        private BigDecimal maxMarks;
        private BigDecimal marksObtained;
        private String grade;
        private String remarks;
        private Instant createdAt;
    }

    // Request DTOs
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateCourseRequest {
        private String name;
        private String code;
        private String duration;
        private BigDecimal totalFees;
        private String description;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateBatchRequest {
        private Long courseId;
        private String batchName;
        private String schedule;
        private String startDate;
        private String endDate;
        private Integer capacity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateStudentRequest {
        private String fullName;
        private String studentIdNumber;
        private String email;
        private String phone;
        private String parentName;
        private String parentPhone;
        private String address;
        private String admissionDate;
        private Long currentBatchId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnrollStudentRequest {
        private Long studentId;
        private Long batchId;
        private Long courseId;
        private BigDecimal discount;
        private BigDecimal initialPayment;
        private String paymentMethod;
        private String nextDueDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecordFeePaymentRequest {
        private Long enrollmentId;
        private BigDecimal amount;
        private String paymentMethod;
        private String paymentDate;
        private String notes;
        private String nextDueDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MarkAttendanceRequest {
        private Long batchId;
        private String attendanceDate;
        private List<StudentAttendanceItem> attendances;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentAttendanceItem {
        private Long studentId;
        private String status; // PRESENT, ABSENT, LATE, EXCUSED
        private String remarks;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateStudentRequest {
        private String fullName;
        private String studentIdNumber;
        private String email;
        private String phone;
        private String parentName;
        private String parentPhone;
        private String address;
        private String admissionDate;
        private String status;
        private Long currentBatchId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EducationSummaryDto {
        private Long totalStudents;
        private Long activeStudents;
        private Long inactiveStudents;
        private Long totalBatches;
        private Long activeBatches;
        private Long totalCourses;
        private BigDecimal totalCollectedFees;
        private BigDecimal totalPendingFees;
        private Long overdueCount;
        private List<StudentDto> recentAdmissions;
        private List<EnrollmentDto> pendingDues;
        private List<FeePaymentDto> recentPayments;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecordExamResultRequest {
        private Long batchId;
        private Long studentId;
        private String examName;
        private String subject;
        private String examDate;
        private BigDecimal maxMarks;
        private BigDecimal marksObtained;
        private String grade;
        private String remarks;
    }
}

