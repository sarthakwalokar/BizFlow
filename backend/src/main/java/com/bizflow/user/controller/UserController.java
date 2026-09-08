package com.bizflow.user.controller;

import com.bizflow.auth.dto.UserResponse;
import com.bizflow.common.api.ApiResponse;
import com.bizflow.user.dto.PasswordChangeRequest;
import com.bizflow.user.dto.UserProfileUpdateRequest;
import com.bizflow.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "Endpoints for personal profile and password management")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get Personal Profile", description = "Returns profile details for the authenticated user")
    public ResponseEntity<ApiResponse<UserResponse>> getMyProfile() {
        UserResponse response = userService.getCurrentUserProfile();
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", response));
    }

    @PutMapping("/me")
    @Operation(summary = "Update Personal Profile", description = "Updates personal contact details (name and phone)")
    public ResponseEntity<ApiResponse<UserResponse>> updateMyProfile(@Valid @RequestBody UserProfileUpdateRequest request) {
        UserResponse response = userService.updateCurrentUserProfile(request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @PostMapping("/me/change-password")
    @Operation(summary = "Change Password", description = "Changes password after verifying the current password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody PasswordChangeRequest request) {
        userService.changePassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }
}
