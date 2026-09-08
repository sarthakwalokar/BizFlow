package com.bizflow.user.controller;

import com.bizflow.auth.dto.UserResponse;
import com.bizflow.config.CorsConfig;
import com.bizflow.security.CustomUserDetailsService;
import com.bizflow.security.JwtAuthenticationEntryPoint;
import com.bizflow.security.JwtAuthenticationFilter;
import com.bizflow.security.JwtTokenProvider;
import com.bizflow.user.Role;
import com.bizflow.user.dto.PasswordChangeRequest;
import com.bizflow.user.dto.UserProfileUpdateRequest;
import com.bizflow.user.service.UserService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(CorsConfig.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("GET /api/v1/users/me - should return own profile")
    void getMyProfile_shouldReturnOk() throws Exception {
        UserResponse response = UserResponse.builder()
                .id(1L)
                .fullName("Alice Owner")
                .email("alice@bakery.com")
                .role(Role.OWNER)
                .build();

        given(userService.getCurrentUserProfile()).willReturn(response);

        mockMvc.perform(get("/api/v1/users/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fullName").value("Alice Owner"));
    }

    @Test
    @DisplayName("PUT /api/v1/users/me - should update own profile")
    void updateMyProfile_shouldReturnOk() throws Exception {
        UserProfileUpdateRequest request = UserProfileUpdateRequest.builder()
                .fullName("Alice New Name")
                .phone("+1555999888")
                .build();

        UserResponse response = UserResponse.builder()
                .id(1L)
                .fullName("Alice New Name")
                .phone("+1555999888")
                .build();

        given(userService.updateCurrentUserProfile(any(UserProfileUpdateRequest.class))).willReturn(response);

        mockMvc.perform(put("/api/v1/users/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fullName").value("Alice New Name"));
    }

    @Test
    @DisplayName("POST /api/v1/users/me/change-password - should change password")
    void changePassword_shouldReturnOk() throws Exception {
        PasswordChangeRequest request = PasswordChangeRequest.builder()
                .currentPassword("OldPassword123!")
                .newPassword("NewPassword123!")
                .build();

        mockMvc.perform(post("/api/v1/users/me/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
