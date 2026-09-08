package com.bizflow.auth.controller;

import com.bizflow.auth.dto.AuthResponse;
import com.bizflow.auth.dto.LoginRequest;
import com.bizflow.auth.dto.SignupRequest;
import com.bizflow.auth.dto.UserResponse;
import com.bizflow.auth.service.AuthService;
import com.bizflow.business.BusinessType;
import com.bizflow.business.dto.BusinessResponse;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(CorsConfig.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("POST /api/v1/auth/signup - should register owner & business successfully")
    void signup_shouldReturnCreated() throws Exception {
        SignupRequest request = SignupRequest.builder()
                .fullName("Alice Owner")
                .email("alice@bakery.com")
                .password("Password123!")
                .phone("+1234567890")
                .businessName("Alice Bakery")
                .businessType(BusinessType.BAKERY)
                .businessAddress("123 Flour St")
                .build();

        UserResponse userResponse = UserResponse.builder()
                .id(1L)
                .fullName("Alice Owner")
                .email("alice@bakery.com")
                .role(Role.OWNER)
                .businessId(1L)
                .enabled(true)
                .createdAt(Instant.now())
                .build();

        BusinessResponse businessResponse = BusinessResponse.builder()
                .id(1L)
                .name("Alice Bakery")
                .businessType(BusinessType.BAKERY)
                .active(true)
                .build();

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken("mock-jwt-token")
                .tokenType("Bearer")
                .expiresIn(86400)
                .user(userResponse)
                .business(businessResponse)
                .build();

        given(authService.signup(any(SignupRequest.class))).willReturn(authResponse);

        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("mock-jwt-token"))
                .andExpect(jsonPath("$.data.user.email").value("alice@bakery.com"))
                .andExpect(jsonPath("$.data.user.role").value("OWNER"))
                .andExpect(jsonPath("$.data.business.name").value("Alice Bakery"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - should authenticate and return token")
    void login_shouldReturnOkWithToken() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("alice@bakery.com")
                .password("Password123!")
                .build();

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken("valid-jwt-token")
                .tokenType("Bearer")
                .expiresIn(86400)
                .user(UserResponse.builder().id(1L).email("alice@bakery.com").role(Role.OWNER).build())
                .build();

        given(authService.login(any(LoginRequest.class))).willReturn(authResponse);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("valid-jwt-token"));
    }

    @Test
    @DisplayName("GET /api/v1/auth/me - should return current user profile")
    void getCurrentUser_shouldReturnOk() throws Exception {
        AuthResponse authResponse = AuthResponse.builder()
                .user(UserResponse.builder().id(1L).email("alice@bakery.com").role(Role.OWNER).build())
                .business(BusinessResponse.builder().id(1L).name("Alice Bakery").build())
                .build();

        given(authService.getCurrentUser()).willReturn(authResponse);

        mockMvc.perform(get("/api/v1/auth/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.user.email").value("alice@bakery.com"));
    }
}
