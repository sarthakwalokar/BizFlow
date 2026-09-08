package com.bizflow.business.service;

import com.bizflow.auth.dto.StaffCreateRequest;
import com.bizflow.auth.dto.StaffPasswordResetRequest;
import com.bizflow.auth.dto.StaffUpdateRequest;
import com.bizflow.auth.dto.UserResponse;
import com.bizflow.business.Business;
import com.bizflow.business.BusinessRepository;
import com.bizflow.business.dto.BusinessResponse;
import com.bizflow.business.dto.BusinessUpdateRequest;
import com.bizflow.common.exception.BadRequestException;
import com.bizflow.common.exception.DuplicateResourceException;
import com.bizflow.common.exception.ResourceNotFoundException;
import com.bizflow.security.SecurityUtils;
import com.bizflow.user.Role;
import com.bizflow.user.User;
import com.bizflow.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BusinessService {

    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public BusinessResponse getCurrentBusiness() {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", "id", businessId));

        return BusinessResponse.fromEntity(business);
    }

    @Transactional
    public BusinessResponse updateCurrentBusiness(BusinessUpdateRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", "id", businessId));

        business.setName(request.getName().trim());
        if (request.getBusinessType() != null) {
            business.setBusinessType(request.getBusinessType());
        }
        if (request.getAddress() != null) {
            business.setAddress(request.getAddress());
        }
        if (request.getPhone() != null) {
            business.setPhone(request.getPhone());
        }
        if (request.getEmail() != null) {
            business.setEmail(request.getEmail());
        }
        if (request.getLogo() != null) {
            business.setLogo(request.getLogo());
        }
        if (request.getCurrency() != null && !request.getCurrency().isBlank()) {
            business.setCurrency(request.getCurrency());
        }
        if (request.getTimezone() != null && !request.getTimezone().isBlank()) {
            business.setTimezone(request.getTimezone());
        }

        // Tax configuration
        if (request.getTaxRate() != null) {
            business.setTaxRate(request.getTaxRate());
        }
        if (request.getTaxName() != null && !request.getTaxName().isBlank()) {
            business.setTaxName(request.getTaxName());
        }
        if (request.getTaxNumber() != null) {
            business.setTaxNumber(request.getTaxNumber());
        }
        if (request.getTaxInclusive() != null) {
            business.setTaxInclusive(request.getTaxInclusive());
        }

        Business updated = businessRepository.save(business);
        log.info("Business {} updated successfully by owner", businessId);
        return BusinessResponse.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getBusinessStaff() {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        List<User> staffMembers = userRepository.findByBusinessId(businessId);
        return staffMembers.stream()
                .filter(u -> u.getRole() == Role.STAFF)
                .map(UserResponse::fromEntity)
                .toList();
    }

    @Transactional
    public UserResponse createStaff(StaffCreateRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        String email = request.getEmail().toLowerCase().trim();

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("User", "email", email);
        }

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", "id", businessId));

        User staff = User.builder()
                .business(business)
                .fullName(request.getFullName().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.STAFF) // Enforced role
                .permissions(request.getPermissions())
                .enabled(true)
                .active(true)
                .build();

        User savedStaff = userRepository.save(staff);
        log.info("Staff user {} onboarded for business {}", email, businessId);

        return UserResponse.fromEntity(savedStaff);
    }

    @Transactional
    public UserResponse updateStaff(Long staffId, StaffUpdateRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "id", staffId));

        // Strict tenant isolation check
        if (staff.getBusiness() == null || !staff.getBusiness().getId().equals(businessId) || staff.getRole() != Role.STAFF) {
            throw new BadRequestException("You are not authorized to manage this staff member.");
        }

        staff.setFullName(request.getFullName().trim());
        staff.setPhone(request.getPhone());
        staff.setPermissions(request.getPermissions());

        User updated = userRepository.save(staff);
        log.info("Staff user {} updated for business {}", staffId, businessId);
        return UserResponse.fromEntity(updated);
    }

    @Transactional
    public UserResponse updateStaffStatus(Long staffId, boolean active) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "id", staffId));

        // Strict tenant isolation check
        if (staff.getBusiness() == null || !staff.getBusiness().getId().equals(businessId) || staff.getRole() != Role.STAFF) {
            throw new BadRequestException("You are not authorized to manage this staff member.");
        }

        staff.setActive(active);
        staff.setEnabled(active);
        User updated = userRepository.save(staff);
        log.info("Staff user {} active status set to {} for business {}", staffId, active, businessId);
        return UserResponse.fromEntity(updated);
    }

    @Transactional
    public void resetStaffPassword(Long staffId, StaffPasswordResetRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "id", staffId));

        // Strict tenant isolation check
        if (staff.getBusiness() == null || !staff.getBusiness().getId().equals(businessId) || staff.getRole() != Role.STAFF) {
            throw new BadRequestException("You are not authorized to reset password for this staff member.");
        }

        staff.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(staff);
        log.info("Staff user {} password reset by owner for business {}", staffId, businessId);
    }
}
