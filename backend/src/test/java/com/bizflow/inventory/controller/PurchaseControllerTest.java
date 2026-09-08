package com.bizflow.inventory.controller;

import com.bizflow.common.api.PageResponse;
import com.bizflow.inventory.PurchaseStatus;
import com.bizflow.inventory.dto.PurchaseItemRequest;
import com.bizflow.inventory.dto.PurchaseItemResponse;
import com.bizflow.inventory.dto.PurchaseRequest;
import com.bizflow.inventory.dto.PurchaseResponse;
import com.bizflow.inventory.service.PurchaseService;
import com.bizflow.payment.PaymentMethod;
import com.bizflow.payment.PaymentStatus;
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
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PurchaseController.class)
@AutoConfigureMockMvc(addFilters = false)
class PurchaseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PurchaseService purchaseService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @WithMockUser(roles = "OWNER")
    void testCreatePurchase() throws Exception {
        PurchaseItemRequest itemReq = PurchaseItemRequest.builder()
                .productId(101L)
                .productName("Dark Roast Beans")
                .quantity(50)
                .unitCost(BigDecimal.valueOf(8.50))
                .build();

        PurchaseRequest request = PurchaseRequest.builder()
                .purchaseDate(LocalDate.now())
                .status(PurchaseStatus.RECEIVED)
                .paymentStatus(PaymentStatus.COMPLETED)
                .paymentMethod(PaymentMethod.CASH)
                .items(List.of(itemReq))
                .build();

        PurchaseItemResponse itemResp = PurchaseItemResponse.builder()
                .id(1L)
                .productId(101L)
                .productNameSnapshot("Dark Roast Beans")
                .quantity(50)
                .unitCost(BigDecimal.valueOf(8.50))
                .subtotal(BigDecimal.valueOf(425.00))
                .build();

        PurchaseResponse response = PurchaseResponse.builder()
                .id(1L)
                .businessId(10L)
                .purchaseNumber("PO-20260906-1001")
                .status(PurchaseStatus.RECEIVED)
                .totalAmount(BigDecimal.valueOf(425.00))
                .purchaseDate(LocalDate.now())
                .items(List.of(itemResp))
                .build();

        when(purchaseService.createPurchase(any(PurchaseRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/inventory/purchases")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.purchaseNumber").value("PO-20260906-1001"))
                .andExpect(jsonPath("$.data.totalAmount").value(425.00));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void testGetPurchaseById() throws Exception {
        PurchaseResponse response = PurchaseResponse.builder()
                .id(1L)
                .businessId(10L)
                .purchaseNumber("PO-20260906-1001")
                .status(PurchaseStatus.RECEIVED)
                .totalAmount(BigDecimal.valueOf(425.00))
                .purchaseDate(LocalDate.now())
                .build();

        when(purchaseService.getPurchaseById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/inventory/purchases/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.purchaseNumber").value("PO-20260906-1001"));
    }
}
