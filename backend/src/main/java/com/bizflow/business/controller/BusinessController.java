package com.bizflow.business.controller;

import com.bizflow.auth.dto.StaffCreateRequest;
import com.bizflow.auth.dto.StaffPasswordResetRequest;
import com.bizflow.auth.dto.StaffUpdateRequest;
import com.bizflow.auth.dto.UserResponse;
import com.bizflow.business.dto.BusinessResponse;
import com.bizflow.business.dto.BusinessUpdateRequest;
import com.bizflow.business.service.BusinessService;
import com.bizflow.common.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/business")
@RequiredArgsConstructor
@Tag(name = "Business Management", description = "Endpoints for managing business profiles, tax settings, and staff lifecycle")
public class BusinessController {

    private final BusinessService businessService;

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get Current Business Profile", description = "Returns the business profile associated with the authenticated user")
    public ResponseEntity<ApiResponse<BusinessResponse>> getMyBusiness() {
        BusinessResponse response = businessService.getCurrentBusiness();
        return ResponseEntity.ok(ApiResponse.success("Business profile retrieved successfully", response));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Update Business Profile & Tax Settings", description = "Allows business owners to update business information and tax preferences")
    public ResponseEntity<ApiResponse<BusinessResponse>> updateMyBusiness(@Valid @RequestBody BusinessUpdateRequest request) {
        BusinessResponse response = businessService.updateCurrentBusiness(request);
        return ResponseEntity.ok(ApiResponse.success("Business settings updated successfully", response));
    }

    @GetMapping("/staff")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "List Business Staff", description = "Returns all staff members belonging to the owner's business")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getBusinessStaff() {
        List<UserResponse> staff = businessService.getBusinessStaff();
        return ResponseEntity.ok(ApiResponse.success("Staff members retrieved successfully", staff));
    }

    @PostMapping("/staff")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Add New Staff Member", description = "Creates and onboards a new staff user for the owner's business")
    public ResponseEntity<ApiResponse<UserResponse>> createStaff(@Valid @RequestBody StaffCreateRequest request) {
        UserResponse response = businessService.createStaff(request);
        return new ResponseEntity<>(
                ApiResponse.created("Staff member onboarded successfully", response),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/staff/{id}")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Update Staff Member", description = "Updates details and permissions of an existing staff member")
    public ResponseEntity<ApiResponse<UserResponse>> updateStaff(
            @PathVariable Long id,
            @Valid @RequestBody StaffUpdateRequest request) {
        UserResponse response = businessService.updateStaff(id, request);
        return ResponseEntity.ok(ApiResponse.success("Staff member updated successfully", response));
    }

    @PatchMapping("/staff/{id}/status")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Toggle Staff Active Status", description = "Enables or disables a staff member's account")
    public ResponseEntity<ApiResponse<UserResponse>> updateStaffStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        UserResponse response = businessService.updateStaffStatus(id, active);
        return ResponseEntity.ok(ApiResponse.success("Staff status updated successfully", response));
    }

    @PostMapping("/staff/{id}/reset-password")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Reset Staff Password", description = "Resets password for a staff member")
    public ResponseEntity<ApiResponse<Void>> resetStaffPassword(
            @PathVariable Long id,
            @Valid @RequestBody StaffPasswordResetRequest request) {
        businessService.resetStaffPassword(id, request);
        return ResponseEntity.ok(ApiResponse.success("Staff password has been reset successfully", null));
    }
}
