package com.bizflow.modules.education;

import com.bizflow.business.Business;
import com.bizflow.business.BusinessRepository;
import com.bizflow.common.exception.ResourceNotFoundException;
import com.bizflow.modules.education.EducationDtos.*;
import com.bizflow.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EducationService {

    private final EduCourseRepository courseRepository;
    private final EduBatchRepository batchRepository;
    private final EduStudentRepository studentRepository;
    private final EduEnrollmentRepository enrollmentRepository;
    private final EduFeePaymentRepository paymentRepository;
    private final EduAttendanceRepository attendanceRepository;
    private final EduExamResultRepository examResultRepository;
    private final BusinessRepository businessRepository;

    // Courses
    @Transactional(readOnly = true)
    public List<CourseDto> getCourses() {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        return courseRepository.findByBusinessIdOrderByNameAsc(businessId)
                .stream().map(this::mapCourseToDto).collect(Collectors.toList());
    }

    @Transactional
    public CourseDto createCourse(CreateCourseRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        EduCourse course = EduCourse.builder()
                .business(business)
                .name(request.getName().trim())
                .code(request.getCode() != null ? request.getCode().trim() : "")
                .duration(request.getDuration() != null ? request.getDuration().trim() : "6 Months")
                .totalFees(request.getTotalFees() != null ? request.getTotalFees() : BigDecimal.ZERO)
                .description(request.getDescription())
                .isActive(true)
                .build();

        return mapCourseToDto(courseRepository.save(course));
    }

    @Transactional
    public CourseDto updateCourse(Long id, CreateCourseRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        EduCourse course = courseRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            course.setName(request.getName().trim());
        }
        if (request.getCode() != null) {
            course.setCode(request.getCode().trim());
        }
        if (request.getDuration() != null) {
            course.setDuration(request.getDuration().trim());
        }
        if (request.getTotalFees() != null) {
            course.setTotalFees(request.getTotalFees());
        }
        if (request.getDescription() != null) {
            course.setDescription(request.getDescription().trim());
        }

        return mapCourseToDto(courseRepository.save(course));
    }

    @Transactional
    public void deleteCourse(Long id) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        EduCourse course = courseRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        courseRepository.delete(course);
    }

    // Batches
    @Transactional(readOnly = true)
    public List<BatchDto> getBatches() {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        return batchRepository.findByBusinessIdOrderByStartDateDesc(businessId)
                .stream().map(this::mapBatchToDto).collect(Collectors.toList());
    }

    @Transactional
    public BatchDto createBatch(CreateBatchRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        EduCourse course = courseRepository.findByIdAndBusinessId(request.getCourseId(), businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        LocalDate start = request.getStartDate() != null ? LocalDate.parse(request.getStartDate()) : LocalDate.now();
        LocalDate end = request.getEndDate() != null && !request.getEndDate().isEmpty() ? LocalDate.parse(request.getEndDate()) : null;

        EduBatch batch = EduBatch.builder()
                .business(business)
                .course(course)
                .batchName(request.getBatchName().trim())
                .schedule(request.getSchedule() != null ? request.getSchedule().trim() : "Regular")
                .startDate(start)
                .endDate(end)
                .capacity(request.getCapacity() != null ? request.getCapacity() : 30)
                .isActive(true)
                .build();

        return mapBatchToDto(batchRepository.save(batch));
    }

    @Transactional
    public BatchDto updateBatch(Long id, CreateBatchRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        EduBatch batch = batchRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));

        if (request.getCourseId() != null) {
            EduCourse course = courseRepository.findByIdAndBusinessId(request.getCourseId(), businessId)
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
            batch.setCourse(course);
        }
        if (request.getBatchName() != null && !request.getBatchName().trim().isEmpty()) {
            batch.setBatchName(request.getBatchName().trim());
        }
        if (request.getSchedule() != null) {
            batch.setSchedule(request.getSchedule().trim());
        }
        if (request.getStartDate() != null && !request.getStartDate().isEmpty()) {
            batch.setStartDate(LocalDate.parse(request.getStartDate()));
        }
        if (request.getEndDate() != null) {
            batch.setEndDate(!request.getEndDate().isEmpty() ? LocalDate.parse(request.getEndDate()) : null);
        }
        if (request.getCapacity() != null) {
            batch.setCapacity(request.getCapacity());
        }

        return mapBatchToDto(batchRepository.save(batch));
    }

    @Transactional
    public void deleteBatch(Long id) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        EduBatch batch = batchRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));
        batchRepository.delete(batch);
    }

    // Students
    @Transactional(readOnly = true)
    public List<StudentDto> getStudents(String search) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        List<EduStudent> list;
        if (search != null && !search.trim().isEmpty()) {
            list = studentRepository.searchStudents(businessId, search.trim());
        } else {
            list = studentRepository.findByBusinessIdOrderByFullNameAsc(businessId);
        }
        return list.stream().map(this::mapStudentToDto).collect(Collectors.toList());
    }

    @Transactional
    public StudentDto createStudent(CreateStudentRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        EduBatch batch = null;
        if (request.getCurrentBatchId() != null) {
            batch = batchRepository.findByIdAndBusinessId(request.getCurrentBatchId(), businessId).orElse(null);
        }

        LocalDate admDate = request.getAdmissionDate() != null && !request.getAdmissionDate().isEmpty()
                ? LocalDate.parse(request.getAdmissionDate())
                : LocalDate.now();

        String rollNum = request.getStudentIdNumber() != null && !request.getStudentIdNumber().trim().isEmpty()
                ? request.getStudentIdNumber().trim()
                : "STU-" + (System.currentTimeMillis() % 1000000);

        EduStudent student = EduStudent.builder()
                .business(business)
                .fullName(request.getFullName().trim())
                .studentIdNumber(rollNum)
                .email(request.getEmail() != null ? request.getEmail().trim() : null)
                .phone(request.getPhone() != null ? request.getPhone().trim() : "")
                .parentName(request.getParentName() != null ? request.getParentName().trim() : null)
                .parentPhone(request.getParentPhone() != null ? request.getParentPhone().trim() : null)
                .address(request.getAddress() != null ? request.getAddress().trim() : null)
                .admissionDate(admDate)
                .status("ACTIVE")
                .currentBatch(batch)
                .build();

        EduStudent saved = studentRepository.save(student);

        // If batch provided, auto-enroll
        if (batch != null && batch.getCourse() != null) {
            EduCourse course = batch.getCourse();
            BigDecimal totalFees = course.getTotalFees();
            EduEnrollment enrollment = EduEnrollment.builder()
                    .business(business)
                    .student(saved)
                    .batch(batch)
                    .course(course)
                    .enrollmentDate(admDate)
                    .totalFees(totalFees)
                    .discount(BigDecimal.ZERO)
                    .netFees(totalFees)
                    .paidAmount(BigDecimal.ZERO)
                    .pendingAmount(totalFees)
                    .nextDueDate(admDate.plusDays(30))
                    .paymentStatus("PENDING")
                    .build();
            enrollmentRepository.save(enrollment);
        }

        return mapStudentToDto(saved);
    }

    @Transactional
    public StudentDto updateStudent(Long id, UpdateStudentRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        EduStudent student = studentRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            student.setFullName(request.getFullName().trim());
        }
        if (request.getStudentIdNumber() != null && !request.getStudentIdNumber().trim().isEmpty()) {
            student.setStudentIdNumber(request.getStudentIdNumber().trim());
        }
        if (request.getEmail() != null) {
            student.setEmail(request.getEmail().trim());
        }
        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            student.setPhone(request.getPhone().trim());
        }
        if (request.getParentName() != null) {
            student.setParentName(request.getParentName().trim());
        }
        if (request.getParentPhone() != null) {
            student.setParentPhone(request.getParentPhone().trim());
        }
        if (request.getAddress() != null) {
            student.setAddress(request.getAddress().trim());
        }
        if (request.getAdmissionDate() != null && !request.getAdmissionDate().isEmpty()) {
            student.setAdmissionDate(LocalDate.parse(request.getAdmissionDate()));
        }
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            student.setStatus(request.getStatus().trim().toUpperCase());
        }

        if (request.getCurrentBatchId() != null) {
            EduBatch newBatch = batchRepository.findByIdAndBusinessId(request.getCurrentBatchId(), businessId).orElse(null);
            student.setCurrentBatch(newBatch);
        }

        EduStudent saved = studentRepository.save(student);
        return mapStudentToDto(saved);
    }

    @Transactional
    public void deleteStudent(Long id) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        EduStudent student = studentRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        studentRepository.delete(student);
    }

    // Education Summary
    @Transactional(readOnly = true)
    public EducationSummaryDto getEducationSummary() {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        List<EduStudent> students = studentRepository.findByBusinessIdOrderByFullNameAsc(businessId);
        List<EduBatch> batches = batchRepository.findByBusinessIdOrderByStartDateDesc(businessId);
        List<EduCourse> courses = courseRepository.findByBusinessIdOrderByNameAsc(businessId);
        List<EduEnrollment> enrollments = enrollmentRepository.findByBusinessIdOrderByCreatedAtDesc(businessId);
        List<EduFeePayment> payments = paymentRepository.findByBusinessIdOrderByPaymentDateDesc(businessId);

        long activeStudents = students.stream().filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus())).count();
        long inactiveStudents = students.size() - activeStudents;
        long activeBatches = batches.stream().filter(b -> Boolean.TRUE.equals(b.getIsActive())).count();

        BigDecimal totalCollected = payments.stream()
                .map(EduFeePayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPending = enrollments.stream()
                .map(EduEnrollment::getPendingAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDate today = LocalDate.now();
        long overdueCount = enrollments.stream()
                .filter(e -> e.getPendingAmount().compareTo(BigDecimal.ZERO) > 0
                        && e.getNextDueDate() != null
                        && e.getNextDueDate().isBefore(today))
                .count();

        List<StudentDto> recentAdmissions = students.stream()
                .limit(5)
                .map(this::mapStudentToDto)
                .collect(Collectors.toList());

        List<EnrollmentDto> pendingDues = enrollments.stream()
                .filter(e -> e.getPendingAmount().compareTo(BigDecimal.ZERO) > 0)
                .limit(5)
                .map(this::mapEnrollmentToDto)
                .collect(Collectors.toList());

        List<FeePaymentDto> recentPayments = payments.stream()
                .limit(5)
                .map(p -> FeePaymentDto.builder()
                        .id(p.getId())
                        .enrollmentId(p.getEnrollment().getId())
                        .studentId(p.getStudent().getId())
                        .studentName(p.getStudent().getFullName())
                        .receiptNumber(p.getReceiptNumber())
                        .amount(p.getAmount())
                        .paymentDate(p.getPaymentDate())
                        .paymentMethod(p.getPaymentMethod())
                        .notes(p.getNotes())
                        .createdAt(p.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return EducationSummaryDto.builder()
                .totalStudents((long) students.size())
                .activeStudents(activeStudents)
                .inactiveStudents(inactiveStudents)
                .totalBatches((long) batches.size())
                .activeBatches(activeBatches)
                .totalCourses((long) courses.size())
                .totalCollectedFees(totalCollected)
                .totalPendingFees(totalPending)
                .overdueCount(overdueCount)
                .recentAdmissions(recentAdmissions)
                .pendingDues(pendingDues)
                .recentPayments(recentPayments)
                .build();
    }

    // Enrollments & Fees
    @Transactional(readOnly = true)
    public List<EnrollmentDto> getEnrollments(String paymentStatus) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        List<EduEnrollment> list;
        if (paymentStatus != null && !paymentStatus.isEmpty()) {
            list = enrollmentRepository.findByBusinessIdAndPaymentStatus(businessId, paymentStatus);
        } else {
            list = enrollmentRepository.findByBusinessIdOrderByCreatedAtDesc(businessId);
        }
        return list.stream().map(this::mapEnrollmentToDto).collect(Collectors.toList());
    }


    @Transactional
    public EnrollmentDto recordFeePayment(RecordFeePaymentRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        EduEnrollment enrollment = enrollmentRepository.findByIdAndBusinessId(request.getEnrollmentId(), businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));

        BigDecimal amt = request.getAmount() != null ? request.getAmount() : BigDecimal.ZERO;
        BigDecimal newPaid = enrollment.getPaidAmount().add(amt);
        BigDecimal newPending = enrollment.getNetFees().subtract(newPaid);
        if (newPending.compareTo(BigDecimal.ZERO) < 0) newPending = BigDecimal.ZERO;

        enrollment.setPaidAmount(newPaid);
        enrollment.setPendingAmount(newPending);
        if (newPending.compareTo(BigDecimal.ZERO) == 0) {
            enrollment.setPaymentStatus("PAID");
        } else {
            enrollment.setPaymentStatus("PARTIAL");
        }

        if (request.getNextDueDate() != null && !request.getNextDueDate().isEmpty()) {
            enrollment.setNextDueDate(LocalDate.parse(request.getNextDueDate()));
        }

        EduEnrollment saved = enrollmentRepository.save(enrollment);

        String receiptNum = "REC-" + (System.currentTimeMillis() % 1000000);
        LocalDate pDate = request.getPaymentDate() != null ? LocalDate.parse(request.getPaymentDate()) : LocalDate.now();

        EduFeePayment payment = EduFeePayment.builder()
                .business(business)
                .enrollment(saved)
                .student(saved.getStudent())
                .receiptNumber(receiptNum)
                .amount(amt)
                .paymentDate(pDate)
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH")
                .notes(request.getNotes())
                .build();
        paymentRepository.save(payment);

        return mapEnrollmentToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<FeePaymentDto> getFeePayments() {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        return paymentRepository.findByBusinessIdOrderByPaymentDateDesc(businessId)
                .stream().map(p -> FeePaymentDto.builder()
                        .id(p.getId())
                        .enrollmentId(p.getEnrollment().getId())
                        .studentId(p.getStudent().getId())
                        .studentName(p.getStudent().getFullName())
                        .receiptNumber(p.getReceiptNumber())
                        .amount(p.getAmount())
                        .paymentDate(p.getPaymentDate())
                        .paymentMethod(p.getPaymentMethod())
                        .notes(p.getNotes())
                        .createdAt(p.getCreatedAt())
                        .build()).collect(Collectors.toList());
    }

    // Attendance
    @Transactional(readOnly = true)
    public List<AttendanceDto> getAttendance(Long batchId, String date) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        LocalDate attDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        List<EduAttendance> list = attendanceRepository.findByBusinessIdAndBatchIdAndAttendanceDate(businessId, batchId, attDate);

        return list.stream().map(a -> AttendanceDto.builder()
                .id(a.getId())
                .batchId(a.getBatch().getId())
                .studentId(a.getStudent().getId())
                .studentName(a.getStudent().getFullName())
                .attendanceDate(a.getAttendanceDate())
                .status(a.getStatus())
                .remarks(a.getRemarks())
                .createdAt(a.getCreatedAt())
                .build()).collect(Collectors.toList());
    }

    @Transactional
    public List<AttendanceDto> markAttendance(MarkAttendanceRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        EduBatch batch = batchRepository.findByIdAndBusinessId(request.getBatchId(), businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));

        LocalDate attDate = request.getAttendanceDate() != null ? LocalDate.parse(request.getAttendanceDate()) : LocalDate.now();
        List<AttendanceDto> result = new ArrayList<>();

        if (request.getAttendances() != null) {
            for (StudentAttendanceItem item : request.getAttendances()) {
                EduStudent student = studentRepository.findByIdAndBusinessId(item.getStudentId(), businessId).orElse(null);
                if (student != null) {
                    EduAttendance attendance = EduAttendance.builder()
                            .business(business)
                            .batch(batch)
                            .student(student)
                            .attendanceDate(attDate)
                            .status(item.getStatus() != null ? item.getStatus() : "PRESENT")
                            .remarks(item.getRemarks())
                            .build();

                    EduAttendance saved = attendanceRepository.save(attendance);
                    result.add(AttendanceDto.builder()
                            .id(saved.getId())
                            .batchId(batch.getId())
                            .studentId(student.getId())
                            .studentName(student.getFullName())
                            .attendanceDate(saved.getAttendanceDate())
                            .status(saved.getStatus())
                            .remarks(saved.getRemarks())
                            .createdAt(saved.getCreatedAt())
                            .build());
                }
            }
        }
        return result;
    }

    // Exam Results
    @Transactional(readOnly = true)
    public List<ExamResultDto> getExamResults(Long batchId) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        List<EduExamResult> list = examResultRepository.findByBusinessIdAndBatchIdOrderByExamDateDesc(businessId, batchId);
        return list.stream().map(e -> ExamResultDto.builder()
                .id(e.getId())
                .batchId(e.getBatch().getId())
                .studentId(e.getStudent().getId())
                .studentName(e.getStudent().getFullName())
                .examName(e.getExamName())
                .subject(e.getSubject())
                .examDate(e.getExamDate())
                .maxMarks(e.getMaxMarks())
                .marksObtained(e.getMarksObtained())
                .grade(e.getGrade())
                .remarks(e.getRemarks())
                .createdAt(e.getCreatedAt())
                .build()).collect(Collectors.toList());
    }

    @Transactional
    public ExamResultDto recordExamResult(RecordExamResultRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        EduBatch batch = batchRepository.findByIdAndBusinessId(request.getBatchId(), businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));

        EduStudent student = studentRepository.findByIdAndBusinessId(request.getStudentId(), businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        LocalDate exDate = request.getExamDate() != null ? LocalDate.parse(request.getExamDate()) : LocalDate.now();

        EduExamResult result = EduExamResult.builder()
                .business(business)
                .batch(batch)
                .student(student)
                .examName(request.getExamName().trim())
                .subject(request.getSubject().trim())
                .examDate(exDate)
                .maxMarks(request.getMaxMarks() != null ? request.getMaxMarks() : BigDecimal.valueOf(100))
                .marksObtained(request.getMarksObtained() != null ? request.getMarksObtained() : BigDecimal.ZERO)
                .grade(request.getGrade())
                .remarks(request.getRemarks())
                .build();

        EduExamResult saved = examResultRepository.save(result);
        return ExamResultDto.builder()
                .id(saved.getId())
                .batchId(batch.getId())
                .studentId(student.getId())
                .studentName(student.getFullName())
                .examName(saved.getExamName())
                .subject(saved.getSubject())
                .examDate(saved.getExamDate())
                .maxMarks(saved.getMaxMarks())
                .marksObtained(saved.getMarksObtained())
                .grade(saved.getGrade())
                .remarks(saved.getRemarks())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    private CourseDto mapCourseToDto(EduCourse c) {
        return CourseDto.builder()
                .id(c.getId())
                .name(c.getName())
                .code(c.getCode())
                .duration(c.getDuration())
                .totalFees(c.getTotalFees())
                .description(c.getDescription())
                .isActive(c.getIsActive())
                .createdAt(c.getCreatedAt())
                .build();
    }

    private BatchDto mapBatchToDto(EduBatch b) {
        int count = studentRepository.findByBusinessIdAndCurrentBatchId(b.getBusiness().getId(), b.getId()).size();
        return BatchDto.builder()
                .id(b.getId())
                .courseId(b.getCourse().getId())
                .courseName(b.getCourse().getName())
                .batchName(b.getBatchName())
                .schedule(b.getSchedule())
                .startDate(b.getStartDate())
                .endDate(b.getEndDate())
                .capacity(b.getCapacity())
                .enrolledCount(count)
                .isActive(b.getIsActive())
                .createdAt(b.getCreatedAt())
                .build();
    }

    private StudentDto mapStudentToDto(EduStudent s) {
        return StudentDto.builder()
                .id(s.getId())
                .fullName(s.getFullName())
                .studentIdNumber(s.getStudentIdNumber())
                .email(s.getEmail())
                .phone(s.getPhone())
                .parentName(s.getParentName())
                .parentPhone(s.getParentPhone())
                .address(s.getAddress())
                .admissionDate(s.getAdmissionDate())
                .status(s.getStatus())
                .currentBatchId(s.getCurrentBatch() != null ? s.getCurrentBatch().getId() : null)
                .currentBatchName(s.getCurrentBatch() != null ? s.getCurrentBatch().getBatchName() : null)
                .createdAt(s.getCreatedAt())
                .build();
    }

    private EnrollmentDto mapEnrollmentToDto(EduEnrollment e) {
        return EnrollmentDto.builder()
                .id(e.getId())
                .studentId(e.getStudent().getId())
                .studentName(e.getStudent().getFullName())
                .studentPhone(e.getStudent().getPhone())
                .batchId(e.getBatch().getId())
                .batchName(e.getBatch().getBatchName())
                .courseId(e.getCourse().getId())
                .courseName(e.getCourse().getName())
                .enrollmentDate(e.getEnrollmentDate())
                .totalFees(e.getTotalFees())
                .discount(e.getDiscount())
                .netFees(e.getNetFees())
                .paidAmount(e.getPaidAmount())
                .pendingAmount(e.getPendingAmount())
                .nextDueDate(e.getNextDueDate())
                .paymentStatus(e.getPaymentStatus())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
