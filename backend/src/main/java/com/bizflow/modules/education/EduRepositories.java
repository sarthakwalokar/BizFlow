package com.bizflow.modules.education;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
interface EduCourseRepository extends JpaRepository<EduCourse, Long> {
    List<EduCourse> findByBusinessIdOrderByNameAsc(Long businessId);
    Optional<EduCourse> findByIdAndBusinessId(Long id, Long businessId);
}

@Repository
interface EduBatchRepository extends JpaRepository<EduBatch, Long> {
    List<EduBatch> findByBusinessIdOrderByStartDateDesc(Long businessId);
    List<EduBatch> findByBusinessIdAndCourseId(Long businessId, Long courseId);
    Optional<EduBatch> findByIdAndBusinessId(Long id, Long businessId);
}

@Repository
interface EduStudentRepository extends JpaRepository<EduStudent, Long> {
    List<EduStudent> findByBusinessIdOrderByFullNameAsc(Long businessId);
    List<EduStudent> findByBusinessIdAndCurrentBatchId(Long businessId, Long batchId);
    Optional<EduStudent> findByIdAndBusinessId(Long id, Long businessId);

    @Query("SELECT s FROM EduStudent s WHERE s.business.id = :businessId AND " +
            "(LOWER(s.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(s.studentIdNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(s.phone) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<EduStudent> searchStudents(@Param("businessId") Long businessId, @Param("query") String query);
}

@Repository
interface EduEnrollmentRepository extends JpaRepository<EduEnrollment, Long> {
    List<EduEnrollment> findByBusinessIdOrderByCreatedAtDesc(Long businessId);
    List<EduEnrollment> findByBusinessIdAndStudentId(Long businessId, Long studentId);
    List<EduEnrollment> findByBusinessIdAndPaymentStatus(Long businessId, String paymentStatus);
    Optional<EduEnrollment> findByIdAndBusinessId(Long id, Long businessId);
}

@Repository
interface EduFeePaymentRepository extends JpaRepository<EduFeePayment, Long> {
    List<EduFeePayment> findByBusinessIdOrderByPaymentDateDesc(Long businessId);
    List<EduFeePayment> findByBusinessIdAndStudentIdOrderByPaymentDateDesc(Long businessId, Long studentId);
}

@Repository
interface EduAttendanceRepository extends JpaRepository<EduAttendance, Long> {
    List<EduAttendance> findByBusinessIdAndBatchIdAndAttendanceDate(Long businessId, Long batchId, LocalDate date);
    List<EduAttendance> findByBusinessIdAndStudentIdOrderByAttendanceDateDesc(Long businessId, Long studentId);
}

@Repository
interface EduExamResultRepository extends JpaRepository<EduExamResult, Long> {
    List<EduExamResult> findByBusinessIdAndBatchIdOrderByExamDateDesc(Long businessId, Long batchId);
    List<EduExamResult> findByBusinessIdAndStudentIdOrderByExamDateDesc(Long businessId, Long studentId);
}
