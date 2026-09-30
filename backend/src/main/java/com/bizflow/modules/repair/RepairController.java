package com.bizflow.modules.repair;

import com.bizflow.common.api.ApiResponse;
import com.bizflow.modules.repair.RepairDtos.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/repairs")
@RequiredArgsConstructor
@Tag(name = "Repair Module", description = "Job Cards, Repair Status, Tracking and Customer History APIs")
@SecurityRequirement(name = "bearerAuth")
public class RepairController {

    private final RepairService repairService;

    @GetMapping("/job-cards")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get repair job cards with optional search or status filter")
    public ResponseEntity<ApiResponse<List<JobCardDto>>> getJobCards(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.ok("Job cards retrieved", repairService.getJobCards(search, status)));
    }

    @PostMapping("/job-cards")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Create a new repair job card")
    public ResponseEntity<ApiResponse<JobCardDto>> createJobCard(@RequestBody CreateJobCardRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Job card created", repairService.createJobCard(request)));
    }

    @PutMapping("/job-cards/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Update repair job card progress, diagnostic notes or status")
    public ResponseEntity<ApiResponse<JobCardDto>> updateJobCard(
            @PathVariable Long id,
            @RequestBody UpdateJobCardRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Job card updated", repairService.updateJobCard(id, request)));
    }

    @GetMapping("/customer-history")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get previous repair history for a customer")
    public ResponseEntity<ApiResponse<List<JobCardDto>>> getCustomerRepairHistory(@RequestParam String phone) {
        return ResponseEntity.ok(ApiResponse.ok("Customer repair history retrieved", repairService.getCustomerRepairHistory(phone)));
    }

    @DeleteMapping("/job-cards/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Delete repair job card")
    public ResponseEntity<ApiResponse<Void>> deleteJobCard(@PathVariable Long id) {
        repairService.deleteJobCard(id);
        return ResponseEntity.ok(ApiResponse.ok("Job card deleted", null));
    }
}
