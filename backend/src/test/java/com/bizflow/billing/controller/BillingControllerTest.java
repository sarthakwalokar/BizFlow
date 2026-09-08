package com.bizflow.billing.controller;

import com.bizflow.billing.OrderStatus;
import com.bizflow.billing.dto.*;
import com.bizflow.billing.service.BillingService;
import com.bizflow.common.api.PageResponse;
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
import java.time.Instant;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BillingController.class)
@AutoConfigureMockMvc(addFilters = false)
class BillingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BillingService billingService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @WithMockUser(roles = "STAFF")
    void testCreateOrder() throws Exception {
        OrderItemRequest itemReq = OrderItemRequest.builder()
                .productName("Dark Roast Coffee")
                .productType("PHYSICAL")
                .quantity(BigDecimal.valueOf(2))
                .unitPrice(BigDecimal.valueOf(4.50))
                .build();

        CreateOrderRequest request = CreateOrderRequest.builder()
                .items(List.of(itemReq))
                .paymentMethod(PaymentMethod.CASH)
                .markAsPaid(true)
                .build();

        OrderResponse response = OrderResponse.builder()
                .id(100L)
                .businessId(1L)
                .businessName("Apex Cafe")
                .invoiceNumber("INV-20260906-1001")
                .subtotal(BigDecimal.valueOf(9.00))
                .discount(BigDecimal.ZERO)
                .tax(BigDecimal.valueOf(0.72))
                .total(BigDecimal.valueOf(9.72))
                .paymentStatus(PaymentStatus.COMPLETED)
                .orderStatus(OrderStatus.COMPLETED)
                .paymentMethod(PaymentMethod.CASH)
                .createdBy("Cashier Jane")
                .createdAt(Instant.now())
                .build();

        when(billingService.createOrder(any(CreateOrderRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/billing/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.invoiceNumber").value("INV-20260906-1001"))
                .andExpect(jsonPath("$.data.total").value(9.72));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void testGetOrders() throws Exception {
        OrderResponse response = OrderResponse.builder()
                .id(101L)
                .businessId(1L)
                .invoiceNumber("INV-20260906-1002")
                .total(BigDecimal.valueOf(25.00))
                .paymentStatus(PaymentStatus.COMPLETED)
                .orderStatus(OrderStatus.COMPLETED)
                .createdAt(Instant.now())
                .build();

        PageResponse<OrderResponse> pageResponse = PageResponse.<OrderResponse>builder()
                .content(Collections.singletonList(response))
                .pageNumber(0)
                .pageSize(20)
                .totalElements(1L)
                .totalPages(1)
                .isLast(true)
                .build();

        when(billingService.getOrders(any(), any(), any(), any(), any(), any(), anyInt(), anyInt(), anyString()))
                .thenReturn(pageResponse);

        mockMvc.perform(get("/api/v1/billing/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].invoiceNumber").value("INV-20260906-1002"));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void testCancelOrder() throws Exception {
        CancelOrderRequest cancelReq = CancelOrderRequest.builder().reason("Customer duplicate order").build();
        OrderResponse response = OrderResponse.builder()
                .id(100L)
                .invoiceNumber("INV-20260906-1001")
                .orderStatus(OrderStatus.CANCELLED)
                .paymentStatus(PaymentStatus.CANCELLED)
                .build();

        when(billingService.cancelOrder(eq(100L), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/billing/orders/100/cancel")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cancelReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.orderStatus").value("CANCELLED"));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void testGetDashboardSummary() throws Exception {
        BillingSummaryResponse summary = BillingSummaryResponse.builder()
                .todaySales(BigDecimal.valueOf(1450.50))
                .todayOrdersCount(34L)
                .pendingDueAmount(BigDecimal.valueOf(120.00))
                .currency("INR")
                .recentOrders(Collections.emptyList())
                .build();

        when(billingService.getDashboardSummary()).thenReturn(summary);

        mockMvc.perform(get("/api/v1/billing/dashboard/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.todaySales").value(1450.50))
                .andExpect(jsonPath("$.data.todayOrdersCount").value(34));
    }
}
