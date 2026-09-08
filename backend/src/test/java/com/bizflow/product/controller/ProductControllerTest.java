package com.bizflow.product.controller;

import com.bizflow.config.CorsConfig;
import com.bizflow.product.ProductType;
import com.bizflow.product.dto.ProductRequest;
import com.bizflow.product.dto.ProductResponse;
import com.bizflow.product.service.ProductService;
import com.bizflow.security.CustomUserDetailsService;
import com.bizflow.security.JwtAuthenticationEntryPoint;
import com.bizflow.security.JwtAuthenticationFilter;
import com.bizflow.security.JwtTokenProvider;
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

@WebMvcTest(ProductController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(CorsConfig.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductService productService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("GET /api/v1/products - should return list of products and services")
    void getProducts_shouldReturnOk() throws Exception {
        ProductResponse prod = ProductResponse.builder()
                .id(1L)
                .businessId(1L)
                .name("Croissant")
                .productType(ProductType.PHYSICAL)
                .price(new BigDecimal("3.50"))
                .costPrice(new BigDecimal("1.20"))
                .sku("CRO-001")
                .active(true)
                .build();

        given(productService.searchProducts(any(), any(), any(), any()))
                .willReturn(Collections.singletonList(prod));

        mockMvc.perform(get("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("Croissant"))
                .andExpect(jsonPath("$.data[0].productType").value("PHYSICAL"))
                .andExpect(jsonPath("$.data[0].price").value(3.50));
    }

    @Test
    @DisplayName("POST /api/v1/products - should create physical product or service")
    void createProduct_shouldReturnCreated() throws Exception {
        ProductRequest request = ProductRequest.builder()
                .name("Haircut & Styling")
                .productType(ProductType.SERVICE)
                .price(new BigDecimal("45.00"))
                .costPrice(new BigDecimal("10.00"))
                .sku("SRV-HC-01")
                .active(true)
                .build();

        ProductResponse response = ProductResponse.builder()
                .id(2L)
                .businessId(1L)
                .name("Haircut & Styling")
                .productType(ProductType.SERVICE)
                .price(new BigDecimal("45.00"))
                .costPrice(new BigDecimal("10.00"))
                .sku("SRV-HC-01")
                .active(true)
                .build();

        given(productService.createProduct(any(ProductRequest.class))).willReturn(response);

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Haircut & Styling"))
                .andExpect(jsonPath("$.data.productType").value("SERVICE"));
    }

    @Test
    @DisplayName("PUT /api/v1/products/1 - should update product details")
    void updateProduct_shouldReturnOk() throws Exception {
        ProductRequest request = ProductRequest.builder()
                .name("Almond Croissant")
                .productType(ProductType.PHYSICAL)
                .price(new BigDecimal("4.25"))
                .costPrice(new BigDecimal("1.50"))
                .sku("CRO-002")
                .build();

        ProductResponse response = ProductResponse.builder()
                .id(1L)
                .name("Almond Croissant")
                .productType(ProductType.PHYSICAL)
                .price(new BigDecimal("4.25"))
                .build();

        given(productService.updateProduct(eq(1L), any(ProductRequest.class))).willReturn(response);

        mockMvc.perform(put("/api/v1/products/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Almond Croissant"));
    }

    @Test
    @DisplayName("PATCH /api/v1/products/1/status - should toggle product active status")
    void updateProductStatus_shouldReturnOk() throws Exception {
        ProductResponse response = ProductResponse.builder()
                .id(1L)
                .name("Almond Croissant")
                .active(false)
                .build();

        given(productService.updateProductStatus(eq(1L), eq(false))).willReturn(response);

        mockMvc.perform(patch("/api/v1/products/1/status?active=false")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.active").value(false));
    }
}
