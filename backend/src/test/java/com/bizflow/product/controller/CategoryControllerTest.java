package com.bizflow.product.controller;

import com.bizflow.config.CorsConfig;
import com.bizflow.product.dto.CategoryRequest;
import com.bizflow.product.dto.CategoryResponse;
import com.bizflow.product.service.CategoryService;
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

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CategoryController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(CorsConfig.class)
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CategoryService categoryService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("GET /api/v1/categories - should return list of categories")
    void getCategories_shouldReturnOk() throws Exception {
        CategoryResponse cat = CategoryResponse.builder()
                .id(1L)
                .businessId(1L)
                .name("Bakery Goods")
                .active(true)
                .build();

        given(categoryService.getCategories(anyBoolean())).willReturn(Collections.singletonList(cat));

        mockMvc.perform(get("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("Bakery Goods"));
    }

    @Test
    @DisplayName("POST /api/v1/categories - should create a new category")
    void createCategory_shouldReturnCreated() throws Exception {
        CategoryRequest request = CategoryRequest.builder()
                .name("Hot Beverages")
                .description("Coffee and Tea")
                .active(true)
                .build();

        CategoryResponse response = CategoryResponse.builder()
                .id(2L)
                .businessId(1L)
                .name("Hot Beverages")
                .description("Coffee and Tea")
                .active(true)
                .build();

        given(categoryService.createCategory(any(CategoryRequest.class))).willReturn(response);

        mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Hot Beverages"));
    }

    @Test
    @DisplayName("PUT /api/v1/categories/1 - should update category")
    void updateCategory_shouldReturnOk() throws Exception {
        CategoryRequest request = CategoryRequest.builder()
                .name("Specialty Coffee")
                .build();

        CategoryResponse response = CategoryResponse.builder()
                .id(1L)
                .name("Specialty Coffee")
                .build();

        given(categoryService.updateCategory(eq(1L), any(CategoryRequest.class))).willReturn(response);

        mockMvc.perform(put("/api/v1/categories/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Specialty Coffee"));
    }

    @Test
    @DisplayName("DELETE /api/v1/categories/1 - should delete category")
    void deleteCategory_shouldReturnOk() throws Exception {
        mockMvc.perform(delete("/api/v1/categories/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
