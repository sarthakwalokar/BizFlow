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
        String cleanEmail = request.getEmail() != null ? request.getEmail().toLowerCase().trim() : "";
        log.info("Registering new business owner with email: {}", cleanEmail);

        if (userRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new DuplicateResourceException("User", "email", cleanEmail);
        }

        // 1. Create and persist Business entity
        Business business = Business.builder()
                .name(request.getBusinessName().trim())
                .businessType(request.getBusinessType())
                .address(request.getBusinessAddress())
                .phone(request.getBusinessPhone() != null ? request.getBusinessPhone() : request.getPhone())
                .email(request.getBusinessEmail() != null ? request.getBusinessEmail() : cleanEmail)
                .currency("INR")
                .timezone("Asia/Kolkata")
                .active(true)
                .build();

        Business savedBusiness = businessRepository.save(business);

        // 2. Create and persist Owner User entity
        User owner = User.builder()
                .business(savedBusiness)
                .fullName(request.getFullName().trim())
                .email(cleanEmail)
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

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail() != null ? request.getEmail().toLowerCase().trim() : "";
        log.info("Authenticating user with email: {}", email);

        // 1. Find user by case-insensitive email
        User user = userRepository.findByEmailIgnoreCase(email)
                .or(() -> userRepository.findByEmail(email))
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        // 2. Validate password via SmartPasswordEncoder
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        // 3. Self-heal account activation if needed
        try {
            if (!user.isEnabled() || !user.isActive()) {
                user.setEnabled(true);
                user.setActive(true);
                userRepository.save(user);
            }
        } catch (Exception ex) {
            log.warn("Could not self-heal user status: {}", ex.getMessage());
        }

        // 4. Defensively resolve and self-heal business activation
        Business business = null;
        try {
            business = user.getBusiness();
            if (business != null && !business.isActive()) {
                business.setActive(true);
                businessRepository.save(business);
            }
        } catch (Exception ex) {
            log.warn("Could not resolve or activate business for user: {}", ex.getMessage());
            business = null;
        }

        // 5. Auto-upgrade password hash to strong BCrypt if not already standard BCrypt format
        try {
            String currentHash = user.getPasswordHash();
            if (currentHash == null || (!currentHash.startsWith("$2a$") && !currentHash.startsWith("$2b$") && !currentHash.startsWith("$2y$"))) {
                user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
                userRepository.save(user);
                log.info("Auto-upgraded stored password hash to BCrypt for user: {}", email);
            }
        } catch (Exception ex) {
            log.warn("Could not auto-upgrade password hash: {}", ex.getMessage());
        }

        // 6. Generate JWT Token directly from UserPrincipal
        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String token = tokenProvider.generateTokenFromUser(userPrincipal);

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(jwtExpirationMs / 1000)
                .user(UserResponse.fromEntity(user))
                .business(BusinessResponse.fromEntity(business))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse getCurrentUser() {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Business business = null;
        try {
            business = user.getBusiness();
        } catch (Exception ignored) {}

        return AuthResponse.builder()
                .user(UserResponse.fromEntity(user))
                .business(BusinessResponse.fromEntity(business))
                .build();
    }
}
