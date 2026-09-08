package com.bizflow.user.service;

import com.bizflow.auth.dto.UserResponse;
import com.bizflow.common.exception.BadRequestException;
import com.bizflow.common.exception.ResourceNotFoundException;
import com.bizflow.security.SecurityUtils;
import com.bizflow.user.User;
import com.bizflow.user.UserRepository;
import com.bizflow.user.dto.PasswordChangeRequest;
import com.bizflow.user.dto.UserProfileUpdateRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserResponse getCurrentUserProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse updateCurrentUserProfile(UserProfileUpdateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setFullName(request.getFullName().trim());
        user.setPhone(request.getPhone());

        User saved = userRepository.save(user);
        log.info("User {} profile updated", userId);
        return UserResponse.fromEntity(saved);
    }

    @Transactional
    public void changePassword(PasswordChangeRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password does not match.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("User {} password successfully changed", userId);
    }
}
