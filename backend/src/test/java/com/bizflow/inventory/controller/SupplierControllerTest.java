package com.bizflow.inventory.controller;

import com.bizflow.common.api.PageResponse;
import com.bizflow.inventory.dto.SupplierRequest;
import com.bizflow.inventory.dto.SupplierResponse;
import com.bizflow.inventory.service.SupplierService;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SupplierController.class)
@AutoConfigureMockMvc(addFilters = false)
class SupplierControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SupplierService supplierService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @WithMockUser(roles = "OWNER")
    void testGetActiveSuppliers() throws Exception {
        SupplierResponse supplier = SupplierResponse.builder()
                .id(1L)
                .businessId(10L)
                .name("Acme Roast Imports")
                .contactPerson("John Bean")
                .email("john@acmeroast.com")
                .phone("+1 555 123 4567")
                .active(true)
                .build();

        when(supplierService.getActiveSuppliers()).thenReturn(List.of(supplier));

        mockMvc.perform(get("/api/v1/inventory/suppliers/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("Acme Roast Imports"));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void testCreateSupplier() throws Exception {
        SupplierRequest request = SupplierRequest.builder()
                .name("Acme Roast Imports")
                .contactPerson("John Bean")
                .email("john@acmeroast.com")
                .phone("+1 555 123 4567")
                .active(true)
                .build();

        SupplierResponse created = SupplierResponse.builder()
                .id(1L)
                .businessId(10L)
                .name("Acme Roast Imports")
                .contactPerson("John Bean")
                .email("john@acmeroast.com")
                .phone("+1 555 123 4567")
                .active(true)
                .build();

        when(supplierService.createSupplier(any(SupplierRequest.class))).thenReturn(created);

        mockMvc.perform(post("/api/v1/inventory/suppliers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Acme Roast Imports"));
    }
}
