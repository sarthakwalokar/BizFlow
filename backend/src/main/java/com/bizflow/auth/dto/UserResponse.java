package com.bizflow.auth.dto;

import com.bizflow.user.Role;
import com.bizflow.user.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    private Long businessId;
    private String permissions;
    private boolean enabled;
    private boolean active;
    private Instant createdAt;

    public static UserResponse fromEntity(User user) {
        if (user == null) return null;
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .businessId(user.getBusinessId())
                .permissions(user.getPermissions())
                .enabled(user.isEnabled())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
