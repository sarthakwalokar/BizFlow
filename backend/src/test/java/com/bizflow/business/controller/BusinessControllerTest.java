package com.bizflow.business.controller;

import com.bizflow.auth.dto.StaffCreateRequest;
import com.bizflow.auth.dto.StaffPasswordResetRequest;
import com.bizflow.auth.dto.StaffUpdateRequest;
import com.bizflow.auth.dto.UserResponse;
import com.bizflow.business.BusinessType;
import com.bizflow.business.dto.BusinessResponse;
import com.bizflow.business.dto.BusinessUpdateRequest;
import com.bizflow.business.service.BusinessService;
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

import java.math.BigDecimal;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BusinessController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(CorsConfig.class)
class BusinessControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BusinessService businessService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("GET /api/v1/business/me - should return current business profile")
    void getMyBusiness_shouldReturnOk() throws Exception {
        BusinessResponse response = BusinessResponse.builder()
                .id(1L)
                .name("Alice Bakery")
                .businessType(BusinessType.BAKERY)
                .taxRate(new BigDecimal("8.25"))
                .taxName("Sales Tax")
                .active(true)
                .build();

        given(businessService.getCurrentBusiness()).willReturn(response);

        mockMvc.perform(get("/api/v1/business/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Alice Bakery"))
                .andExpect(jsonPath("$.data.taxRate").value(8.25));
    }

    @Test
    @DisplayName("PUT /api/v1/business/me - should update business settings & tax")
    void updateMyBusiness_shouldReturnOk() throws Exception {
        BusinessUpdateRequest updateRequest = BusinessUpdateRequest.builder()
                .name("Alice Bakery & Cafe")
                .businessType(BusinessType.BAKERY)
                .address("456 Pastry Lane")
                .taxRate(new BigDecimal("9.00"))
                .taxName("GST")
                .taxNumber("GST-123456")
                .taxInclusive(true)
                .build();

        BusinessResponse response = BusinessResponse.builder()
                .id(1L)
                .name("Alice Bakery & Cafe")
                .businessType(BusinessType.BAKERY)
                .address("456 Pastry Lane")
                .taxRate(new BigDecimal("9.00"))
                .taxName("GST")
                .taxNumber("GST-123456")
                .taxInclusive(true)
                .active(true)
                .build();

        given(businessService.updateCurrentBusiness(any(BusinessUpdateRequest.class))).willReturn(response);

        mockMvc.perform(put("/api/v1/business/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Alice Bakery & Cafe"))
                .andExpect(jsonPath("$.data.taxRate").value(9.00))
                .andExpect(jsonPath("$.data.taxInclusive").value(true));
    }

    @Test
    @DisplayName("GET /api/v1/business/staff - should return staff list")
    void getBusinessStaff_shouldReturnOk() throws Exception {
        UserResponse staff = UserResponse.builder()
                .id(2L)
                .fullName("Bob Baker")
                .email("bob@bakery.com")
                .role(Role.STAFF)
                .businessId(1L)
                .build();

        given(businessService.getBusinessStaff()).willReturn(Collections.singletonList(staff));

        mockMvc.perform(get("/api/v1/business/staff")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].fullName").value("Bob Baker"))
                .andExpect(jsonPath("$.data[0].role").value("STAFF"));
    }

    @Test
    @DisplayName("POST /api/v1/business/staff - should onboard new staff user")
    void createStaff_shouldReturnCreated() throws Exception {
        StaffCreateRequest request = StaffCreateRequest.builder()
                .fullName("Charlie Cook")
                .email("charlie@bakery.com")
                .password("Password123!")
                .phone("+1555123456")
                .build();

        UserResponse staff = UserResponse.builder()
                .id(3L)
                .fullName("Charlie Cook")
                .email("charlie@bakery.com")
                .role(Role.STAFF)
                .businessId(1L)
                .build();

        given(businessService.createStaff(any(StaffCreateRequest.class))).willReturn(staff);

        mockMvc.perform(post("/api/v1/business/staff")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("charlie@bakery.com"))
                .andExpect(jsonPath("$.data.role").value("STAFF"));
    }

    @Test
    @DisplayName("PUT /api/v1/business/staff/2 - should update staff details")
    void updateStaff_shouldReturnOk() throws Exception {
        StaffUpdateRequest request = StaffUpdateRequest.builder()
                .fullName("Bob Updated")
                .phone("+1555000111")
                .permissions("MANAGE_ORDERS")
                .build();

        UserResponse staff = UserResponse.builder()
                .id(2L)
                .fullName("Bob Updated")
                .phone("+1555000111")
                .permissions("MANAGE_ORDERS")
                .role(Role.STAFF)
                .build();

        given(businessService.updateStaff(eq(2L), any(StaffUpdateRequest.class))).willReturn(staff);

        mockMvc.perform(put("/api/v1/business/staff/2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fullName").value("Bob Updated"));
    }

    @Test
    @DisplayName("PATCH /api/v1/business/staff/2/status - should toggle staff status")
    void updateStaffStatus_shouldReturnOk() throws Exception {
        UserResponse staff = UserResponse.builder()
                .id(2L)
                .fullName("Bob Baker")
                .active(false)
                .enabled(false)
                .role(Role.STAFF)
                .build();

        given(businessService.updateStaffStatus(eq(2L), eq(false))).willReturn(staff);

        mockMvc.perform(patch("/api/v1/business/staff/2/status?active=false")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.active").value(false));
    }

    @Test
    @DisplayName("POST /api/v1/business/staff/2/reset-password - should reset staff password")
    void resetStaffPassword_shouldReturnOk() throws Exception {
        StaffPasswordResetRequest request = StaffPasswordResetRequest.builder()
                .newPassword("NewTempPass123!")
                .build();

        mockMvc.perform(post("/api/v1/business/staff/2/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
