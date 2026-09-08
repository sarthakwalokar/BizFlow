package com.bizflow.admin.service;

import com.bizflow.admin.dto.*;
import com.bizflow.ai.service.AIGatewayService;
import com.bizflow.auth.dto.UserResponse;
import com.bizflow.billing.OrderRepository;
import com.bizflow.business.Business;
import com.bizflow.business.BusinessRepository;
import com.bizflow.business.BusinessSize;
import com.bizflow.business.BusinessType;
import com.bizflow.business.dto.BusinessResponse;
import com.bizflow.common.api.PageResponse;
import com.bizflow.common.exception.BadRequestException;
import com.bizflow.common.exception.ResourceNotFoundException;
import com.bizflow.customer.CustomerRepository;
import com.bizflow.product.ProductRepository;
import com.bizflow.security.SecurityUtils;
import com.bizflow.user.Role;
import com.bizflow.user.User;
import com.bizflow.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final AIGatewayService aiGatewayService;

    // In-memory system settings (can be persisted as needed)
    private static boolean maintenanceMode = false;
    private static boolean allowSelfRegistration = true;
    private static String defaultCurrency = "INR";
    private static String defaultTimezone = "Asia/Kolkata";
    private static int sessionTimeoutMinutes = 1440; // 24 hours

    @Transactional(readOnly = true)
    public PageResponse<BusinessResponse> searchBusinesses(String search,
                                                          BusinessType businessType,
                                                          Boolean active,
                                                          int page,
                                                          int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        Page<Business> businessPage = businessRepository.searchBusinesses(cleanSearch, businessType, active, pageable);
        return PageResponse.from(businessPage.map(BusinessResponse::fromEntity));
    }

    @Transactional(readOnly = true)
    public AdminBusinessDetailResponse getBusinessDetails(Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", "id", businessId));

        List<User> users = userRepository.findByBusinessId(businessId);
        User ownerUser = users.stream()
                .filter(u -> u.getRole() == Role.OWNER)
                .findFirst()
                .orElse(null);

        long staffCount = users.stream().filter(u -> u.getRole() == Role.STAFF).count();
        long productCount = productRepository.findByBusinessId(businessId).size();
        long customerCount = customerRepository.countByBusinessId(businessId);
        long orderCount = orderRepository.count(); // Approximate or scoped

        AdminBusinessDetailResponse.OwnerSummary ownerSummary = null;
        if (ownerUser != null) {
            ownerSummary = AdminBusinessDetailResponse.OwnerSummary.builder()
                    .id(ownerUser.getId())
                    .fullName(ownerUser.getFullName())
                    .email(ownerUser.getEmail())
                    .phone(ownerUser.getPhone())
                    .enabled(ownerUser.isEnabled())
                    .createdAt(ownerUser.getCreatedAt())
                    .build();
        }

        return AdminBusinessDetailResponse.builder()
                .id(business.getId())
                .name(business.getName())
                .businessType(business.getBusinessType())
                .email(business.getEmail())
                .phone(business.getPhone())
                .address(business.getAddress())
                .logo(business.getLogo())
                .currency(business.getCurrency())
                .timezone(business.getTimezone())
                .taxRate(business.getTaxRate())
                .taxName(business.getTaxName())
                .taxNumber(business.getTaxNumber())
                .taxInclusive(business.isTaxInclusive())
                .reviewSlug(business.getReviewSlug())
                .publicReviewUrl(business.getPublicReviewUrl())
                .reviewEnabled(business.isReviewEnabled())
                .businessSize(business.getBusinessSize())
                .inventoryEnabled(business.isInventoryEnabled())
                .active(business.isActive())
                .createdAt(business.getCreatedAt())
                .updatedAt(business.getUpdatedAt())
                .owner(ownerSummary)
                .staffCount(staffCount)
                .productCount(productCount)
                .orderCount(orderCount)
                .customerCount(customerCount)
                .build();
    }

    @Transactional
    public BusinessResponse updateBusinessStatus(Long businessId, boolean active) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", "id", businessId));

        business.setActive(active);
        Business saved = businessRepository.save(business);
        log.info("Platform admin updated business {} active status to {}", businessId, active);

        return BusinessResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> searchUsers(String search,
                                                  Role role,
                                                  Boolean enabled,
                                                  int page,
                                                  int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        Page<User> userPage = userRepository.searchUsers(cleanSearch, role, enabled, pageable);
        return PageResponse.from(userPage.map(UserResponse::fromEntity));
    }

    @Transactional
    public UserResponse updateUserStatus(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Long currentAdminId = SecurityUtils.getCurrentUserId();
        if (user.getId().equals(currentAdminId)) {
            throw new BadRequestException("Platform administrator cannot disable their own active account.");
        }
        if (user.getRole() == Role.ADMIN && !enabled) {
            throw new BadRequestException("Cannot deactivate a root Platform Administrator account.");
        }

        user.setEnabled(enabled);
        User saved = userRepository.save(user);
        log.info("Platform admin updated user {} enabled status to {}", userId, enabled);

        return UserResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public AdminDashboardStatsResponse getDashboardStats() {
        List<Business> allBusinesses = businessRepository.findAll();
        List<User> allUsers = userRepository.findAll();

        long totalBusinesses = allBusinesses.size();
        long activeBusinesses = allBusinesses.stream().filter(Business::isActive).count();
        long inactiveBusinesses = totalBusinesses - activeBusinesses;

        long totalUsers = allUsers.size();
        long totalOwners = allUsers.stream().filter(u -> u.getRole() == Role.OWNER).count();
        long totalStaff = allUsers.stream().filter(u -> u.getRole() == Role.STAFF).count();

        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();

        // Business Type distribution
        Map<String, Long> typeMap = new LinkedHashMap<>();
        for (BusinessType bt : BusinessType.values()) {
            long count = allBusinesses.stream().filter(b -> b.getBusinessType() == bt).count();
            typeMap.put(bt.name(), count);
        }

        // Business Size distribution
        Map<String, Long> sizeMap = new LinkedHashMap<>();
        for (BusinessSize bs : BusinessSize.values()) {
            long count = allBusinesses.stream().filter(b -> b.getBusinessSize() == bs).count();
            sizeMap.put(bs.name(), count);
        }

        // Recent activity feed
        List<AdminDashboardStatsResponse.AdminActivityItem> activities = new ArrayList<>();
        allBusinesses.stream()
                .sorted(Comparator.comparing(Business::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .forEach(b -> activities.add(AdminDashboardStatsResponse.AdminActivityItem.builder()
                        .id("reg-" + b.getId())
                        .type("TENANT_REGISTERED")
                        .title("New Business Registered")
                        .description(String.format("%s registered as %s tier", b.getName(), b.getBusinessType()))
                        .businessName(b.getName())
                        .timestamp(b.getCreatedAt())
                        .build()));

        return AdminDashboardStatsResponse.builder()
                .totalBusinesses(totalBusinesses)
                .activeBusinesses(activeBusinesses)
                .inactiveBusinesses(inactiveBusinesses)
                .totalUsers(totalUsers)
                .totalOwners(totalOwners)
                .totalStaff(totalStaff)
                .totalProducts(totalProducts)
                .totalOrders(totalOrders)
                .businessTypeDistribution(typeMap)
                .businessSizeDistribution(sizeMap)
                .recentActivity(activities)
                .build();
    }

    @Transactional(readOnly = true)
    public AdminPlatformReportResponse getPlatformReports() {
        List<Business> allBusinesses = businessRepository.findAll();

        long totalTenants = allBusinesses.size();
        long activeTenants = allBusinesses.stream().filter(Business::isActive).count();
        long inactiveTenants = totalTenants - activeTenants;
        double activePct = totalTenants > 0 ? ((double) activeTenants / totalTenants) * 100.0 : 0.0;

        long smallCount = allBusinesses.stream().filter(b -> b.getBusinessSize() == BusinessSize.SMALL).count();
        long largeCount = allBusinesses.stream().filter(b -> b.getBusinessSize() == BusinessSize.LARGE).count();

        Map<String, Long> typeMap = new LinkedHashMap<>();
        for (BusinessType bt : BusinessType.values()) {
            typeMap.put(bt.name(), allBusinesses.stream().filter(b -> b.getBusinessType() == bt).count());
        }

        // Monthly Registration Trend for the last 6 months
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yyyy");
        ZoneId zone = ZoneId.systemDefault();
        YearMonth currentMonth = YearMonth.now();

        List<AdminPlatformReportResponse.MonthlyRegistrationPoint> trend = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth targetMonth = currentMonth.minusMonths(i);
            String label = targetMonth.format(monthFormatter);

            long count = allBusinesses.stream().filter(b -> {
                if (b.getCreatedAt() == null) return false;
                YearMonth bMonth = YearMonth.from(b.getCreatedAt().atZone(zone));
                return bMonth.equals(targetMonth);
            }).count();

            trend.add(new AdminPlatformReportResponse.MonthlyRegistrationPoint(label, count));
        }

        return AdminPlatformReportResponse.builder()
                .totalTenants(totalTenants)
                .activeTenants(activeTenants)
                .inactiveTenants(inactiveTenants)
                .activeTenantPercentage(activePct)
                .smallBusinessesCount(smallCount)
                .largeBusinessesCount(largeCount)
                .businessTypeDistribution(typeMap)
                .registrationTrend(trend)
                .build();
    }

    public AdminSystemConfigResponse getSystemConfig() {
        var aiStatus = aiGatewayService.getAiStatus();

        return AdminSystemConfigResponse.builder()
                .platformName("BizFlow Business Management SaaS")
                .platformVersion("1.0.0")
                .environment("Production-Ready (Dev Profile)")
                .maintenanceMode(maintenanceMode)
                .allowSelfRegistration(allowSelfRegistration)
                .defaultCurrency(defaultCurrency)
                .defaultTimezone(defaultTimezone)
                .sessionTimeoutMinutes(sessionTimeoutMinutes)
                .serverTime(Instant.now())
                .activeAiProvider(aiStatus.getActiveProvider())
                .availableAiProviders(aiStatus.getAvailableProviders())
                .build();
    }

    public AdminSystemConfigResponse updateSystemConfig(AdminSystemConfigRequest request) {
        if (request.getMaintenanceMode() != null) {
            maintenanceMode = request.getMaintenanceMode();
        }
        if (request.getAllowSelfRegistration() != null) {
            allowSelfRegistration = request.getAllowSelfRegistration();
        }
        if (request.getDefaultCurrency() != null && !request.getDefaultCurrency().isBlank()) {
            defaultCurrency = request.getDefaultCurrency().trim().toUpperCase();
        }
        if (request.getDefaultTimezone() != null && !request.getDefaultTimezone().isBlank()) {
            defaultTimezone = request.getDefaultTimezone().trim();
        }
        if (request.getSessionTimeoutMinutes() != null && request.getSessionTimeoutMinutes() > 0) {
            sessionTimeoutMinutes = request.getSessionTimeoutMinutes();
        }

        log.info("Platform system configurations updated by admin");
        return getSystemConfig();
    }
}
