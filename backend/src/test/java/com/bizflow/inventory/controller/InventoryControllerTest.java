package com.bizflow.inventory.controller;

import com.bizflow.business.BusinessSize;
import com.bizflow.common.api.PageResponse;
import com.bizflow.inventory.MovementType;
import com.bizflow.inventory.ReferenceType;
import com.bizflow.inventory.dto.*;
import com.bizflow.inventory.service.InventoryService;
import com.bizflow.product.ProductType;
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

@WebMvcTest(InventoryController.class)
@AutoConfigureMockMvc(addFilters = false)
class InventoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private InventoryService inventoryService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @WithMockUser(roles = "OWNER")
    void testGetInventorySummary() throws Exception {
        InventorySummaryResponse summary = InventorySummaryResponse.builder()
                .businessSize(BusinessSize.SMALL)
                .inventoryEnabled(true)
                .totalTrackedProducts(25L)
                .inStockProducts(20L)
                .lowStockProducts(3L)
                .outOfStockProducts(2L)
                .totalInventoryValuation(BigDecimal.valueOf(15000.00))
                .totalRetailValuation(BigDecimal.valueOf(25000.00))
                .currency("INR")
                .recentMovements(Collections.emptyList())
                .build();

        when(inventoryService.getInventorySummary()).thenReturn(summary);

        mockMvc.perform(get("/api/v1/inventory/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.businessSize").value("SMALL"))
                .andExpect(jsonPath("$.data.totalTrackedProducts").value(25));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void testGetStockList() throws Exception {
        StockItemResponse item = StockItemResponse.builder()
                .productId(101L)
                .productName("Dark Roast Coffee Beans")
                .sku("DRC-01")
                .productType(ProductType.PHYSICAL)
                .price(BigDecimal.valueOf(18.50))
                .costPrice(BigDecimal.valueOf(9.00))
                .trackStock(true)
                .stockQuantity(45)
                .lowStockThreshold(10)
                .lowStock(false)
                .outOfStock(false)
                .build();

        PageResponse<StockItemResponse> pageResponse = PageResponse.<StockItemResponse>builder()
                .content(List.of(item))
                .pageNumber(0)
                .pageSize(50)
                .totalElements(1L)
                .totalPages(1)
                .isLast(true)
                .build();

        when(inventoryService.getStockList(any(), any(), any(), anyInt(), anyInt())).thenReturn(pageResponse);

        mockMvc.perform(get("/api/v1/inventory/stock"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].productName").value("Dark Roast Coffee Beans"))
                .andExpect(jsonPath("$.data.content[0].stockQuantity").value(45));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void testAdjustStock() throws Exception {
        StockAdjustRequest request = StockAdjustRequest.builder()
                .productId(101L)
                .adjustmentQuantity(10)
                .notes("New shipment arrival count")
                .build();

        StockItemResponse updated = StockItemResponse.builder()
                .productId(101L)
                .productName("Dark Roast Coffee Beans")
                .trackStock(true)
                .stockQuantity(55)
                .lowStockThreshold(10)
                .build();

        when(inventoryService.adjustStock(any(StockAdjustRequest.class))).thenReturn(updated);

        mockMvc.perform(post("/api/v1/inventory/adjust")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.stockQuantity").value(55));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void testGetStockMovements() throws Exception {
        StockMovementResponse movement = StockMovementResponse.builder()
                .id(1L)
                .productId(101L)
                .productName("Dark Roast Coffee Beans")
                .movementType(MovementType.SALE)
                .quantity(-2)
                .previousStock(55)
                .newStock(53)
                .referenceType(ReferenceType.ORDER)
                .referenceNumber("INV-20260906-1001")
                .createdBy("Cashier Staff")
                .createdAt(Instant.now())
                .build();

        PageResponse<StockMovementResponse> pageResponse = PageResponse.<StockMovementResponse>builder()
                .content(List.of(movement))
                .pageNumber(0)
                .pageSize(20)
                .totalElements(1L)
                .totalPages(1)
                .isLast(true)
                .build();

        when(inventoryService.getStockMovements(any(), any(), any(), any(), any(), anyInt(), anyInt()))
                .thenReturn(pageResponse);

        mockMvc.perform(get("/api/v1/inventory/movements"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].movementType").value("SALE"))
                .andExpect(jsonPath("$.data.content[0].referenceNumber").value("INV-20260906-1001"));
    }
}
