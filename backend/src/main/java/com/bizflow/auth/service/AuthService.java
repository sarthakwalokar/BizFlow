package com.bizflow.auth.service;

import com.bizflow.auth.dto.AuthResponse;
import com.bizflow.auth.dto.LoginRequest;
import com.bizflow.auth.dto.SignupRequest;
import com.bizflow.auth.dto.UserResponse;
import com.bizflow.business.Business;
import com.bizflow.business.BusinessRepository;
import com.bizflow.business.dto.BusinessResponse;
import com.bizflow.common.exception.DuplicateResourceException;
import com.bizflow.common.exception.ResourceNotFoundException;
import com.bizflow.common.exception.UnauthorizedException;
import com.bizflow.security.JwtTokenProvider;
import com.bizflow.security.SecurityUtils;
import com.bizflow.security.UserPrincipal;
import com.bizflow.user.Role;
import com.bizflow.user.User;
import com.bizflow.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        log.info("Registering new business owner with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        // 1. Create and persist Business entity
        Business business = Business.builder()
                .name(request.getBusinessName().trim())
                .businessType(request.getBusinessType())
                .address(request.getBusinessAddress())
                .phone(request.getBusinessPhone() != null ? request.getBusinessPhone() : request.getPhone())
                .email(request.getBusinessEmail() != null ? request.getBusinessEmail() : request.getEmail())
                .currency("INR")
                .timezone("Asia/Kolkata")
                .active(true)
                .build();

        Business savedBusiness = businessRepository.save(business);

        // 2. Create and persist Owner User entity
        User owner = User.builder()
                .business(savedBusiness)
                .fullName(request.getFullName().trim())
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.OWNER)
                .enabled(true)
                .active(true)
                .build();

        User savedOwner = userRepository.save(owner);

        // 3. Generate JWT Token
        UserPrincipal userPrincipal = UserPrincipal.create(savedOwner);
        String token = tokenProvider.generateTokenFromUser(userPrincipal);

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(jwtExpirationMs / 1000)
                .user(UserResponse.fromEntity(savedOwner))
                .business(BusinessResponse.fromEntity(savedBusiness))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        log.info("Authenticating user with email: {}", email);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));

        if (!user.isEnabled() || !user.isActive()) {
            throw new UnauthorizedException("Your user account has been disabled. Please contact support.");
        }

        // If user belongs to a business, verify the business is active
        if (user.getBusiness() != null && !user.getBusiness().isActive()) {
            throw new UnauthorizedException("Your business account is deactivated. Please contact platform administration.");
        }

        String token = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(jwtExpirationMs / 1000)
                .user(UserResponse.fromEntity(user))
                .business(BusinessResponse.fromEntity(user.getBusiness()))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse getCurrentUser() {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return AuthResponse.builder()
                .user(UserResponse.fromEntity(user))
                .business(BusinessResponse.fromEntity(user.getBusiness()))
                .build();
    }
}
