package com.bizflow.admin.controller;

import com.bizflow.admin.dto.*;
import com.bizflow.admin.service.AdminService;
import com.bizflow.auth.dto.UserResponse;
import com.bizflow.business.BusinessType;
import com.bizflow.business.BusinessSize;
import com.bizflow.business.dto.BusinessResponse;
import com.bizflow.common.api.PageResponse;
import com.bizflow.config.CorsConfig;
import com.bizflow.security.CustomUserDetailsService;
import com.bizflow.security.JwtAuthenticationEntryPoint;
import com.bizflow.security.JwtAuthenticationFilter;
import com.bizflow.security.JwtTokenProvider;
import com.bizflow.user.Role;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(CorsConfig.class)
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AdminService adminService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("GET /api/v1/admin/businesses - should return list of businesses")
    void searchBusinesses_shouldReturnOk() throws Exception {
        BusinessResponse biz = BusinessResponse.builder()
                .id(1L)
                .name("Alice Bakery")
                .businessType(BusinessType.BAKERY)
                .active(true)
                .build();

        PageResponse<BusinessResponse> page = PageResponse.<BusinessResponse>builder()
                .content(Collections.singletonList(biz))
                .pageNumber(0)
                .pageSize(20)
                .totalElements(1)
                .totalPages(1)
                .build();

        given(adminService.searchBusinesses(any(), any(), any(), anyInt(), anyInt())).willReturn(page);

        mockMvc.perform(get("/api/v1/admin/businesses")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].name").value("Alice Bakery"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/businesses/1 - should return business details")
    void getBusinessDetails_shouldReturnOk() throws Exception {
        AdminBusinessDetailResponse detail = AdminBusinessDetailResponse.builder()
                .id(1L)
                .name("Alice Bakery")
                .businessType(BusinessType.BAKERY)
                .businessSize(BusinessSize.SMALL)
                .active(true)
                .staffCount(3)
                .productCount(25)
                .orderCount(120)
                .customerCount(45)
                .build();

        given(adminService.getBusinessDetails(1L)).willReturn(detail);

        mockMvc.perform(get("/api/v1/admin/businesses/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Alice Bakery"))
                .andExpect(jsonPath("$.data.staffCount").value(3));
    }

    @Test
    @DisplayName("PATCH /api/v1/admin/businesses/1/status - should update business active status")
    void updateBusinessStatus_shouldReturnOk() throws Exception {
        BusinessStatusUpdateRequest request = BusinessStatusUpdateRequest.builder()
                .active(false)
                .build();

        BusinessResponse response = BusinessResponse.builder()
                .id(1L)
                .name("Alice Bakery")
                .businessType(BusinessType.BAKERY)
                .active(false)
                .build();

        given(adminService.updateBusinessStatus(eq(1L), eq(false))).willReturn(response);

        mockMvc.perform(patch("/api/v1/admin/businesses/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.active").value(false));
    }

    @Test
    @DisplayName("GET /api/v1/admin/users - should return list of users")
    void searchUsers_shouldReturnOk() throws Exception {
        UserResponse user = UserResponse.builder()
                .id(1L)
                .fullName("Alice Owner")
                .email("alice@bakery.com")
                .role(Role.OWNER)
                .enabled(true)
                .build();

        PageResponse<UserResponse> page = PageResponse.<UserResponse>builder()
                .content(Collections.singletonList(user))
                .pageNumber(0)
                .pageSize(20)
                .totalElements(1)
                .totalPages(1)
                .build();

        given(adminService.searchUsers(any(), any(), any(), anyInt(), anyInt())).willReturn(page);

        mockMvc.perform(get("/api/v1/admin/users")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].email").value("alice@bakery.com"));
    }

    @Test
    @DisplayName("PATCH /api/v1/admin/users/1/status - should toggle user enabled status")
    void updateUserStatus_shouldReturnOk() throws Exception {
        AdminUserStatusUpdateRequest req = AdminUserStatusUpdateRequest.builder()
                .enabled(false)
                .build();

        UserResponse user = UserResponse.builder()
                .id(2L)
                .fullName("Staff Member")
                .email("staff@bakery.com")
                .role(Role.STAFF)
                .enabled(false)
                .build();

        given(adminService.updateUserStatus(eq(2L), eq(false))).willReturn(user);

        mockMvc.perform(patch("/api/v1/admin/users/2/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.enabled").value(false));
    }

    @Test
    @DisplayName("GET /api/v1/admin/stats - should return platform statistics")
    void getDashboardStats_shouldReturnOk() throws Exception {
        AdminDashboardStatsResponse stats = AdminDashboardStatsResponse.builder()
                .totalBusinesses(5)
                .activeBusinesses(4)
                .inactiveBusinesses(1)
                .totalUsers(12)
                .totalOwners(5)
                .totalStaff(7)
                .totalProducts(150)
                .totalOrders(320)
                .businessTypeDistribution(Map.of("BAKERY", 2L, "RETAIL", 3L))
                .build();

        given(adminService.getDashboardStats()).willReturn(stats);

        mockMvc.perform(get("/api/v1/admin/stats")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalBusinesses").value(5))
                .andExpect(jsonPath("$.data.totalUsers").value(12));
    }

    @Test
    @DisplayName("GET /api/v1/admin/reports - should return platform reports")
    void getPlatformReports_shouldReturnOk() throws Exception {
        AdminPlatformReportResponse report = AdminPlatformReportResponse.builder()
                .totalTenants(10)
                .activeTenants(9)
                .inactiveTenants(1)
                .activeTenantPercentage(90.0)
                .smallBusinessesCount(8)
                .largeBusinessesCount(2)
                .businessTypeDistribution(Map.of("RETAIL", 6L, "SALON", 4L))
                .registrationTrend(List.of(new AdminPlatformReportResponse.MonthlyRegistrationPoint("Jan 2026", 4)))
                .build();

        given(adminService.getPlatformReports()).willReturn(report);

        mockMvc.perform(get("/api/v1/admin/reports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalTenants").value(10));
    }

    @Test
    @DisplayName("GET /api/v1/admin/system/config - should return system config")
    void getSystemConfig_shouldReturnOk() throws Exception {
        AdminSystemConfigResponse config = AdminSystemConfigResponse.builder()
                .platformName("BizFlow")
                .platformVersion("1.0.0")
                .environment("Production-Ready")
                .maintenanceMode(false)
                .allowSelfRegistration(true)
                .defaultCurrency("INR")
                .serverTime(Instant.now())
                .build();

        given(adminService.getSystemConfig()).willReturn(config);

        mockMvc.perform(get("/api/v1/admin/system/config"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.platformName").value("BizFlow"));
    }
}
