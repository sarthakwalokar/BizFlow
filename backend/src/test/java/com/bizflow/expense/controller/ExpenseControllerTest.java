package com.bizflow.expense.controller;

import com.bizflow.common.api.PageResponse;
import com.bizflow.expense.ExpenseCategory;
import com.bizflow.expense.dto.ExpenseCategorySummary;
import com.bizflow.expense.dto.ExpenseRequest;
import com.bizflow.expense.dto.ExpenseResponse;
import com.bizflow.expense.dto.ExpenseSummaryResponse;
import com.bizflow.expense.service.ExpenseService;
import com.bizflow.payment.PaymentMethod;
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
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ExpenseController.class)
@AutoConfigureMockMvc(addFilters = false)
class ExpenseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ExpenseService expenseService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @WithMockUser(roles = "OWNER")
    void testGetExpenses() throws Exception {
        ExpenseResponse response = ExpenseResponse.builder()
                .id(1L)
                .businessId(10L)
                .category(ExpenseCategory.RENT)
                .description("Shop monthly lease")
                .amount(BigDecimal.valueOf(1200.00))
                .paymentMethod(PaymentMethod.CARD)
                .expenseDate(LocalDate.now())
                .createdAt(Instant.now())
                .build();

        PageResponse<ExpenseResponse> pageResponse = PageResponse.<ExpenseResponse>builder()
                .content(Collections.singletonList(response))
                .pageNumber(0)
                .pageSize(20)
                .totalElements(1L)
                .totalPages(1)
                .isLast(true)
                .build();

        when(expenseService.getExpenses(any(), any(), any(), any(), any(), any(), any(), anyInt(), anyInt(), anyString()))
                .thenReturn(pageResponse);

        mockMvc.perform(get("/api/v1/expenses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].category").value("RENT"))
                .andExpect(jsonPath("$.data.content[0].amount").value(1200.00));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void testCreateExpense() throws Exception {
        ExpenseRequest request = ExpenseRequest.builder()
                .category(ExpenseCategory.ELECTRICITY)
                .description("Monthly electricity bill")
                .amount(BigDecimal.valueOf(150.50))
                .paymentMethod(PaymentMethod.UPI)
                .expenseDate(LocalDate.now())
                .build();

        ExpenseResponse response = ExpenseResponse.builder()
                .id(2L)
                .businessId(10L)
                .category(ExpenseCategory.ELECTRICITY)
                .description("Monthly electricity bill")
                .amount(BigDecimal.valueOf(150.50))
                .paymentMethod(PaymentMethod.UPI)
                .expenseDate(LocalDate.now())
                .createdAt(Instant.now())
                .build();

        when(expenseService.createExpense(any(ExpenseRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/expenses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(2))
                .andExpect(jsonPath("$.data.category").value("ELECTRICITY"))
                .andExpect(jsonPath("$.data.amount").value(150.50));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void testGetExpenseSummary() throws Exception {
        ExpenseCategorySummary catSummary = ExpenseCategorySummary.builder()
                .category(ExpenseCategory.RENT)
                .totalAmount(BigDecimal.valueOf(1200.00))
                .transactionCount(1L)
                .percentage(80.0)
                .build();

        ExpenseSummaryResponse summary = ExpenseSummaryResponse.builder()
                .todayExpenses(BigDecimal.valueOf(150.00))
                .monthExpenses(BigDecimal.valueOf(1500.00))
                .totalExpenses(BigDecimal.valueOf(1500.00))
                .categoryBreakdown(List.of(catSummary))
                .recentExpenses(Collections.emptyList())
                .build();

        when(expenseService.getExpenseSummary()).thenReturn(summary);

        mockMvc.perform(get("/api/v1/expenses/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.todayExpenses").value(150.00))
                .andExpect(jsonPath("$.data.monthExpenses").value(1500.00))
                .andExpect(jsonPath("$.data.categoryBreakdown[0].category").value("RENT"));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void testDeleteExpense() throws Exception {
        doNothing().when(expenseService).deleteExpense(1L);

        mockMvc.perform(delete("/api/v1/expenses/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
