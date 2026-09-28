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
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim().toLowerCase() : null;

        org.springframework.data.jpa.domain.Specification<Business> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            if (businessType != null) {
                predicates.add(cb.equal(root.get("businessType"), businessType));
            }
            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }
            if (cleanSearch != null) {
                String pattern = "%" + cleanSearch + "%";
                jakarta.persistence.criteria.Predicate nameMatch = cb.like(cb.lower(root.get("name")), pattern);
                jakarta.persistence.criteria.Predicate emailMatch = cb.like(cb.lower(root.get("email")), pattern);
                jakarta.persistence.criteria.Predicate phoneMatch = cb.like(root.get("phone"), pattern);
                predicates.add(cb.or(nameMatch, emailMatch, phoneMatch));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<Business> businessPage = businessRepository.findAll(spec, pageable);

        Map<Long, User> ownerByBusinessMap = userRepository.findByRole(Role.OWNER).stream()
                .filter(u -> u.getBusinessId() != null)
                .collect(Collectors.toMap(User::getBusinessId, u -> u, (u1, u2) -> u1));

        Page<BusinessResponse> mapped = businessPage.map(b -> {
            User owner = ownerByBusinessMap.get(b.getId());
            String ownerName = owner != null ? owner.getFullName() : "—";
            String ownerEmail = owner != null ? owner.getEmail() : (b.getEmail() != null ? b.getEmail() : "—");
            return BusinessResponse.fromEntity(b, ownerName, ownerEmail);
        });

        return PageResponse.from(mapped);
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
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim().toLowerCase() : null;

        org.springframework.data.jpa.domain.Specification<User> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            if (role != null) {
                predicates.add(cb.equal(root.get("role"), role));
            }
            if (enabled != null) {
                predicates.add(cb.equal(root.get("enabled"), enabled));
            }
            if (cleanSearch != null) {
                String pattern = "%" + cleanSearch + "%";
                jakarta.persistence.criteria.Predicate nameMatch = cb.like(cb.lower(root.get("fullName")), pattern);
                jakarta.persistence.criteria.Predicate emailMatch = cb.like(cb.lower(root.get("email")), pattern);
                jakarta.persistence.criteria.Predicate phoneMatch = cb.like(root.get("phone"), pattern);
                predicates.add(cb.or(nameMatch, emailMatch, phoneMatch));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<User> userPage = userRepository.findAll(spec, pageable);
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
        long activeUsers = allUsers.stream().filter(User::isEnabled).count();
        long inactiveUsers = totalUsers - activeUsers;
        long totalOwners = allUsers.stream().filter(u -> u.getRole() == Role.OWNER).count();
        long totalStaff = allUsers.stream().filter(u -> u.getRole() == Role.STAFF).count();
        long totalAdmins = allUsers.stream().filter(u -> u.getRole() == Role.ADMIN).count();

        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();

        // Registration Velocity
        ZoneId zone = ZoneId.systemDefault();
        Instant todayStart = java.time.LocalDate.now(zone).atStartOfDay(zone).toInstant();
        Instant sevenDaysAgo = Instant.now().minus(7, java.time.temporal.ChronoUnit.DAYS);
        Instant thirtyDaysAgo = Instant.now().minus(30, java.time.temporal.ChronoUnit.DAYS);

        long newUsersToday = allUsers.stream().filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(todayStart)).count();
        long newUsers7d = allUsers.stream().filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(sevenDaysAgo)).count();
        long newUsers30d = allUsers.stream().filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(thirtyDaysAgo)).count();

        long newBusinessesToday = allBusinesses.stream().filter(b -> b.getCreatedAt() != null && b.getCreatedAt().isAfter(todayStart)).count();
        long newBusinesses7d = allBusinesses.stream().filter(b -> b.getCreatedAt() != null && b.getCreatedAt().isAfter(sevenDaysAgo)).count();
        long newBusinesses30d = allBusinesses.stream().filter(b -> b.getCreatedAt() != null && b.getCreatedAt().isAfter(thirtyDaysAgo)).count();

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

        // Monthly Growth Trend (last 6 months)
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yyyy");
        YearMonth currentMonth = YearMonth.now();
        List<AdminDashboardStatsResponse.MonthlyGrowthPoint> growthTrend = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth targetMonth = currentMonth.minusMonths(i);
            String label = targetMonth.format(monthFormatter);

            long bCount = allBusinesses.stream().filter(b -> {
                if (b.getCreatedAt() == null) return false;
                return YearMonth.from(b.getCreatedAt().atZone(zone)).equals(targetMonth);
            }).count();

            long uCount = allUsers.stream().filter(u -> {
                if (u.getCreatedAt() == null) return false;
                return YearMonth.from(u.getCreatedAt().atZone(zone)).equals(targetMonth);
            }).count();

            growthTrend.add(new AdminDashboardStatsResponse.MonthlyGrowthPoint(label, bCount, uCount));
        }

        Map<Long, Business> businessMap = allBusinesses.stream()
                .collect(Collectors.toMap(Business::getId, b -> b, (b1, b2) -> b1));
        Map<Long, User> ownerByBusinessMap = allUsers.stream()
                .filter(u -> u.getRole() == Role.OWNER && u.getBusinessId() != null)
                .collect(Collectors.toMap(User::getBusinessId, u -> u, (u1, u2) -> u1));

        // Recent Users (last 6)
        List<AdminDashboardStatsResponse.RecentUserItem> recentUsers = allUsers.stream()
                .sorted(Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(6)
                .map(u -> {
                    Business b = u.getBusinessId() != null ? businessMap.get(u.getBusinessId()) : null;
                    return AdminDashboardStatsResponse.RecentUserItem.builder()
                            .id(u.getId())
                            .fullName(u.getFullName())
                            .email(u.getEmail())
                            .phone(u.getPhone())
                            .role(u.getRole())
                            .businessId(u.getBusinessId())
                            .businessName(b != null ? b.getName() : "Platform Administrator")
                            .enabled(u.isEnabled())
                            .createdAt(u.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());

        // Recent Businesses (last 6)
        List<AdminDashboardStatsResponse.RecentBusinessItem> recentBusinesses = allBusinesses.stream()
                .sorted(Comparator.comparing(Business::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(6)
                .map(b -> {
                    User owner = ownerByBusinessMap.get(b.getId());
                    return AdminDashboardStatsResponse.RecentBusinessItem.builder()
                            .id(b.getId())
                            .name(b.getName())
                            .businessType(b.getBusinessType())
                            .ownerName(owner != null ? owner.getFullName() : "—")
                            .email(b.getEmail())
                            .phone(b.getPhone())
                            .active(b.isActive())
                            .createdAt(b.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());

        // Recent Platform Activity Feed (from real database events)
        List<AdminDashboardStatsResponse.AdminActivityItem> activities = new ArrayList<>();
        allBusinesses.forEach(b -> activities.add(AdminDashboardStatsResponse.AdminActivityItem.builder()
                .id("biz-reg-" + b.getId())
                .type("BUSINESS_REGISTERED")
                .title("New Business Registered")
                .description(String.format("%s registered as %s tier", b.getName(), b.getBusinessType()))
                .businessName(b.getName())
                .actor("Business Owner")
                .timestamp(b.getCreatedAt())
                .build()));

        allUsers.forEach(u -> {
            Business b = u.getBusinessId() != null ? businessMap.get(u.getBusinessId()) : null;
            String bName = b != null ? b.getName() : "BizFlow Admin";
            activities.add(AdminDashboardStatsResponse.AdminActivityItem.builder()
                    .id("usr-reg-" + u.getId())
                    .type("USER_REGISTERED")
                    .title("New User Account")
                    .description(String.format("%s registered as %s", u.getFullName(), u.getRole()))
                    .businessName(bName)
                    .actor(u.getFullName())
                    .timestamp(u.getCreatedAt())
                    .build());
        });

        // Top 10 most recent activities
        List<AdminDashboardStatsResponse.AdminActivityItem> topActivities = activities.stream()
                .filter(a -> a.getTimestamp() != null)
                .sorted(Comparator.comparing(AdminDashboardStatsResponse.AdminActivityItem::getTimestamp, Comparator.reverseOrder()))
                .limit(10)
                .collect(Collectors.toList());

        // Platform System Alerts
        List<AdminDashboardStatsResponse.AdminAlertItem> alerts = new ArrayList<>();
        var aiStatus = aiGatewayService.getAiStatus();
        alerts.add(AdminDashboardStatsResponse.AdminAlertItem.builder()
                .id("alert-ai")
                .level("SUCCESS")
                .title("AI Gateway Operational")
                .message("BizFlow AI operating with active provider: " + aiStatus.getActiveProvider())
                .timestamp(Instant.now())
                .build());

        if (inactiveBusinesses > 0) {
            alerts.add(AdminDashboardStatsResponse.AdminAlertItem.builder()
                    .id("alert-inactive-biz")
                    .level("WARNING")
                    .title("Inactive Business Accounts")
                    .message(String.format("%d business account(s) are currently inactive or suspended.", inactiveBusinesses))
                    .timestamp(Instant.now())
                    .build());
        }

        if (inactiveUsers > 0) {
            alerts.add(AdminDashboardStatsResponse.AdminAlertItem.builder()
                    .id("alert-inactive-usr")
                    .level("INFO")
                    .title("Disabled User Accounts")
                    .message(String.format("%d user account(s) are currently disabled.", inactiveUsers))
                    .timestamp(Instant.now())
                    .build());
        }

        if (maintenanceMode) {
            alerts.add(AdminDashboardStatsResponse.AdminAlertItem.builder()
                    .id("alert-maint")
                    .level("ERROR")
                    .title("Maintenance Mode Active")
                    .message("Platform maintenance mode is enabled. Non-admin operations may be restricted.")
                    .timestamp(Instant.now())
                    .build());
        }

        return AdminDashboardStatsResponse.builder()
                .totalBusinesses(totalBusinesses)
                .activeBusinesses(activeBusinesses)
                .inactiveBusinesses(inactiveBusinesses)
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .inactiveUsers(inactiveUsers)
                .totalOwners(totalOwners)
                .totalStaff(totalStaff)
                .totalAdmins(totalAdmins)
                .totalProducts(totalProducts)
                .totalOrders(totalOrders)
                .newUsersToday(newUsersToday)
                .newUsers7d(newUsers7d)
                .newUsers30d(newUsers30d)
                .newBusinessesToday(newBusinessesToday)
                .newBusinesses7d(newBusinesses7d)
                .newBusinesses30d(newBusinesses30d)
                .businessTypeDistribution(typeMap)
                .businessSizeDistribution(sizeMap)
                .monthlyGrowth(growthTrend)
                .recentUsers(recentUsers)
                .recentBusinesses(recentBusinesses)
                .recentActivity(topActivities)
                .systemAlerts(alerts)
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
