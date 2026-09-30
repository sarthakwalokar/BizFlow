package com.bizflow.modules.education;

import com.bizflow.common.api.ApiResponse;
import com.bizflow.modules.education.EducationDtos.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/education")
@RequiredArgsConstructor
@Tag(name = "Education Module", description = "Courses, Batches, Students, Fees, Attendance and Marks APIs")
@SecurityRequirement(name = "bearerAuth")
public class EducationController {

    private final EducationService educationService;

    // Courses
    @GetMapping("/courses")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get all courses")
    public ResponseEntity<ApiResponse<List<CourseDto>>> getCourses() {
        return ResponseEntity.ok(ApiResponse.ok("Courses retrieved", educationService.getCourses()));
    }

    @PostMapping("/courses")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Create course")
    public ResponseEntity<ApiResponse<CourseDto>> createCourse(@RequestBody CreateCourseRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Course created", educationService.createCourse(request)));
    }

    @PutMapping("/courses/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Update course")
    public ResponseEntity<ApiResponse<CourseDto>> updateCourse(@PathVariable Long id, @RequestBody CreateCourseRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Course updated", educationService.updateCourse(id, request)));
    }

    @DeleteMapping("/courses/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Delete course")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long id) {
        educationService.deleteCourse(id);
        return ResponseEntity.ok(ApiResponse.ok("Course deleted", null));
    }

    // Batches
    @GetMapping("/batches")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get all batches")
    public ResponseEntity<ApiResponse<List<BatchDto>>> getBatches() {
        return ResponseEntity.ok(ApiResponse.ok("Batches retrieved", educationService.getBatches()));
    }

    @PostMapping("/batches")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Create batch")
    public ResponseEntity<ApiResponse<BatchDto>> createBatch(@RequestBody CreateBatchRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Batch created", educationService.createBatch(request)));
    }

    @PutMapping("/batches/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Update batch")
    public ResponseEntity<ApiResponse<BatchDto>> updateBatch(@PathVariable Long id, @RequestBody CreateBatchRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Batch updated", educationService.updateBatch(id, request)));
    }

    @DeleteMapping("/batches/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Delete batch")
    public ResponseEntity<ApiResponse<Void>> deleteBatch(@PathVariable Long id) {
        educationService.deleteBatch(id);
        return ResponseEntity.ok(ApiResponse.ok("Batch deleted", null));
    }

    // Students
    @GetMapping("/students")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get students list")
    public ResponseEntity<ApiResponse<List<StudentDto>>> getStudents(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.ok("Students retrieved", educationService.getStudents(search)));
    }

    @PostMapping("/students")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Create/Register student")
    public ResponseEntity<ApiResponse<StudentDto>> createStudent(@RequestBody CreateStudentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Student created", educationService.createStudent(request)));
    }

    @PutMapping("/students/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Update student")
    public ResponseEntity<ApiResponse<StudentDto>> updateStudent(@PathVariable Long id, @RequestBody UpdateStudentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Student updated", educationService.updateStudent(id, request)));
    }

    @DeleteMapping("/students/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Delete student")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable Long id) {
        educationService.deleteStudent(id);
        return ResponseEntity.ok(ApiResponse.ok("Student deleted", null));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get education coaching dashboard summary")
    public ResponseEntity<ApiResponse<EducationSummaryDto>> getEducationSummary() {
        return ResponseEntity.ok(ApiResponse.ok("Education summary retrieved", educationService.getEducationSummary()));
    }


    // Fees & Enrollments
    @GetMapping("/enrollments")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get enrollments with pending fee dues tracking")
    public ResponseEntity<ApiResponse<List<EnrollmentDto>>> getEnrollments(@RequestParam(required = false) String paymentStatus) {
        return ResponseEntity.ok(ApiResponse.ok("Enrollments retrieved", educationService.getEnrollments(paymentStatus)));
    }

    @PostMapping("/fees/pay")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Record fee installment payment")
    public ResponseEntity<ApiResponse<EnrollmentDto>> recordFeePayment(@RequestBody RecordFeePaymentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Fee payment recorded", educationService.recordFeePayment(request)));
    }

    @GetMapping("/fees/payments")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get fee payments history")
    public ResponseEntity<ApiResponse<List<FeePaymentDto>>> getFeePayments() {
        return ResponseEntity.ok(ApiResponse.ok("Fee payments retrieved", educationService.getFeePayments()));
    }

    // Attendance
    @GetMapping("/attendance")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get batch attendance for date")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getAttendance(
            @RequestParam Long batchId,
            @RequestParam(required = false) String date) {
        return ResponseEntity.ok(ApiResponse.ok("Attendance retrieved", educationService.getAttendance(batchId, date)));
    }

    @PostMapping("/attendance")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Mark batch daily attendance")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> markAttendance(@RequestBody MarkAttendanceRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Attendance saved", educationService.markAttendance(request)));
    }

    // Exam Results
    @GetMapping("/exams")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get exam results for batch")
    public ResponseEntity<ApiResponse<List<ExamResultDto>>> getExamResults(@RequestParam Long batchId) {
        return ResponseEntity.ok(ApiResponse.ok("Exam results retrieved", educationService.getExamResults(batchId)));
    }

    @PostMapping("/exams")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Record student exam score")
    public ResponseEntity<ApiResponse<ExamResultDto>> recordExamResult(@RequestBody RecordExamResultRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Exam result recorded", educationService.recordExamResult(request)));
    }
}
