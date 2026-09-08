package com.bizflow.customer.controller;

import com.bizflow.billing.dto.OrderResponse;
import com.bizflow.common.api.PageResponse;
import com.bizflow.customer.dto.CustomerProfileResponse;
import com.bizflow.customer.dto.CustomerRequest;
import com.bizflow.customer.dto.CustomerResponse;
import com.bizflow.customer.service.CustomerService;
import com.bizflow.security.JwtAuthenticationEntryPoint;
import com.bizflow.security.JwtAuthenticationFilter;
import com.bizflow.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CustomerController.class)
@AutoConfigureMockMvc(addFilters = false)
class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CustomerService customerService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @WithMockUser(roles = "OWNER")
    void testGetCustomers() throws Exception {
        CustomerResponse response = CustomerResponse.builder()
                .id(1L)
                .businessId(10L)
                .name("Alice Smith")
                .phone("+15551234")
                .email("alice@example.com")
                .totalSpending(BigDecimal.valueOf(250.00))
                .orderCount(3L)
                .createdAt(Instant.now())
                .build();

        PageResponse<CustomerResponse> pageResponse = PageResponse.<CustomerResponse>builder()
                .content(Collections.singletonList(response))
                .pageNumber(0)
                .pageSize(20)
                .totalElements(1L)
                .totalPages(1)
                .isLast(true)
                .build();

        when(customerService.getCustomers(any(), anyInt(), anyInt(), anyString())).thenReturn(pageResponse);

        mockMvc.perform(get("/api/v1/customers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].name").value("Alice Smith"))
                .andExpect(jsonPath("$.data.content[0].totalSpending").value(250.00));
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void testQuickSearchCustomers() throws Exception {
        CustomerResponse response = CustomerResponse.builder()
                .id(2L)
                .businessId(10L)
                .name("Bob Jones")
                .phone("+15555678")
                .build();

        when(customerService.quickSearchCustomers(anyString())).thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/customers/search").param("query", "Bob"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("Bob Jones"));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void testGetCustomerProfile() throws Exception {
        CustomerProfileResponse profile = CustomerProfileResponse.builder()
                .id(1L)
                .businessId(10L)
                .name("Alice Smith")
                .phone("+15551234")
                .email("alice@example.com")
                .totalSpending(BigDecimal.valueOf(500.00))
                .orderCount(5L)
                .averageOrderValue(BigDecimal.valueOf(100.00))
                .createdAt(Instant.now())
                .build();

        when(customerService.getCustomerProfile(1L)).thenReturn(profile);

        mockMvc.perform(get("/api/v1/customers/1/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Alice Smith"))
                .andExpect(jsonPath("$.data.totalSpending").value(500.00))
                .andExpect(jsonPath("$.data.orderCount").value(5));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void testCreateCustomer() throws Exception {
        CustomerRequest request = CustomerRequest.builder()
                .name("Charlie Brown")
                .phone("+15559999")
                .email("charlie@peanuts.com")
                .build();

        CustomerResponse response = CustomerResponse.builder()
                .id(3L)
                .businessId(10L)
                .name("Charlie Brown")
                .phone("+15559999")
                .email("charlie@peanuts.com")
                .createdAt(Instant.now())
                .build();

        when(customerService.createCustomer(any(CustomerRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(3))
                .andExpect(jsonPath("$.data.name").value("Charlie Brown"));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void testDeleteCustomer() throws Exception {
        doNothing().when(customerService).deleteCustomer(1L);

        mockMvc.perform(delete("/api/v1/customers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
