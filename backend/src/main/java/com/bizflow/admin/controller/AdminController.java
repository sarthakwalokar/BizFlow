package com.bizflow.admin.controller;

import com.bizflow.admin.dto.*;
import com.bizflow.admin.service.AdminService;
import com.bizflow.auth.dto.UserResponse;
import com.bizflow.business.BusinessType;
import com.bizflow.business.dto.BusinessResponse;
import com.bizflow.common.api.ApiResponse;
import com.bizflow.common.api.PageResponse;
import com.bizflow.user.Role;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Platform Administration", description = "Platform-level APIs for managing tenants, users, system settings and reports")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    @Operation(summary = "Get Platform Metrics & Distributions", description = "Returns platform-wide business counts, user counts, and business type distribution")
    public ResponseEntity<ApiResponse<AdminDashboardStatsResponse>> getDashboardStats() {
        AdminDashboardStatsResponse response = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Platform statistics retrieved successfully", response));
    }

    @GetMapping("/businesses")
    @Operation(summary = "Search & Filter All Businesses", description = "Returns a paginated list of all platform businesses with search and filters")
    public ResponseEntity<ApiResponse<PageResponse<BusinessResponse>>> searchBusinesses(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BusinessType businessType,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<BusinessResponse> response = adminService.searchBusinesses(search, businessType, active, page, size);
        return ResponseEntity.ok(ApiResponse.success("Businesses retrieved successfully", response));
    }

    @GetMapping("/businesses/{id}")
    @Operation(summary = "Get Business Details", description = "Returns comprehensive tenant profile, configurations, owner info, and entity counters")
    public ResponseEntity<ApiResponse<AdminBusinessDetailResponse>> getBusinessDetails(@PathVariable Long id) {
        AdminBusinessDetailResponse response = adminService.getBusinessDetails(id);
        return ResponseEntity.ok(ApiResponse.success("Business details retrieved successfully", response));
    }

    @PatchMapping("/businesses/{id}/status")
    @Operation(summary = "Toggle Business Active Status", description = "Activates or deactivates a business tenant")
    public ResponseEntity<ApiResponse<BusinessResponse>> updateBusinessStatus(
            @PathVariable Long id,
            @Valid @RequestBody BusinessStatusUpdateRequest request) {
        BusinessResponse response = adminService.updateBusinessStatus(id, request.getActive());
        return ResponseEntity.ok(ApiResponse.success("Business status updated successfully", response));
    }

    @GetMapping("/users")
    @Operation(summary = "Search & Filter All Users", description = "Returns a paginated list of all platform users across all businesses")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> searchUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<UserResponse> response = adminService.searchUsers(search, role, enabled, page, size);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", response));
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Toggle User Enabled Status", description = "Enables or disables platform user account access")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody AdminUserStatusUpdateRequest request) {
        UserResponse response = adminService.updateUserStatus(id, request.getEnabled());
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", response));
    }

    @GetMapping("/reports")
    @Operation(summary = "Get Platform Growth Reports", description = "Returns platform onboarding velocity, size ratios, and distribution analytics")
    public ResponseEntity<ApiResponse<AdminPlatformReportResponse>> getPlatformReports() {
        AdminPlatformReportResponse response = adminService.getPlatformReports();
        return ResponseEntity.ok(ApiResponse.success("Platform report retrieved successfully", response));
    }

    @GetMapping("/system/config")
    @Operation(summary = "Get System Configurations", description = "Returns platform configuration parameters, environment metrics, and AI status")
    public ResponseEntity<ApiResponse<AdminSystemConfigResponse>> getSystemConfig() {
        AdminSystemConfigResponse response = adminService.getSystemConfig();
        return ResponseEntity.ok(ApiResponse.success("System configuration retrieved successfully", response));
    }

    @PutMapping("/system/config")
    @Operation(summary = "Update System Configurations", description = "Updates platform-level operational parameters")
    public ResponseEntity<ApiResponse<AdminSystemConfigResponse>> updateSystemConfig(
            @RequestBody AdminSystemConfigRequest request) {
        AdminSystemConfigResponse response = adminService.updateSystemConfig(request);
        return ResponseEntity.ok(ApiResponse.success("System configuration updated successfully", response));
    }
}
