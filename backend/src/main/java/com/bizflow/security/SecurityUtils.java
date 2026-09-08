package com.bizflow.security;

import com.bizflow.common.exception.UnauthorizedException;
import com.bizflow.user.Role;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static UserPrincipal getCurrentUserPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof UserPrincipal)) {
            throw new UnauthorizedException("User is not authenticated");
        }
        return (UserPrincipal) authentication.getPrincipal();
    }

    public static Long getCurrentUserId() {
        return getCurrentUserPrincipal().getId();
    }

    public static Long getCurrentBusinessId() {
        Long businessId = getCurrentUserPrincipal().getBusinessId();
        if (businessId == null && getCurrentUserRole() != Role.ADMIN) {
            throw new UnauthorizedException("User does not have an associated business");
        }
        return businessId;
    }

    public static Role getCurrentUserRole() {
        return getCurrentUserPrincipal().getRole();
    }

    public static String getCurrentUserEmail() {
        return getCurrentUserPrincipal().getUsername();
    }
}
