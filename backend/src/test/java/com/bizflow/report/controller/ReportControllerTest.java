package com.bizflow.report.controller;

import com.bizflow.report.dto.*;
import com.bizflow.report.service.ExcelExportService;
import com.bizflow.report.service.PdfExportService;
import com.bizflow.report.service.ReportDataService;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ReportController.class)
@AutoConfigureMockMvc(addFilters = false)
class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ReportDataService reportDataService;

    @MockBean
    private PdfExportService pdfExportService;

    @MockBean
    private ExcelExportService excelExportService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @WithMockUser(roles = "OWNER")
    void testPreviewReport() throws Exception {
        ReportFilterRequest request = ReportFilterRequest.builder()
                .reportType(ReportType.SALES)
                .startDate(LocalDate.now().minusDays(7))
                .endDate(LocalDate.now())
                .build();

        ReportDataResponse response = ReportDataResponse.builder()
                .reportType(ReportType.SALES)
                .title("Sales & Revenue Ledger Report")
                .businessName("Apex Coffee Co.")
                .currency("INR")
                .startDate(LocalDate.now().minusDays(7))
                .endDate(LocalDate.now())
                .generatedAt(LocalDateTime.now())
                .summaryCards(List.of(ReportSummaryCard.builder().title("Total Sales Revenue").value("1500 USD").subtitle("10 orders").build()))
                .columns(List.of(ReportColumn.builder().key("invoiceNumber").label("Invoice #").type("STRING").align("LEFT").build()))
                .rows(List.of(Map.of("invoiceNumber", "INV-1001", "total", 150.00)))
                .totalRows(1)
                .build();

        when(reportDataService.generateReportData(any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/reports/preview")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.reportType").value("SALES"))
                .andExpect(jsonPath("$.data.businessName").value("Apex Coffee Co."))
                .andExpect(jsonPath("$.data.rows[0].invoiceNumber").value("INV-1001"));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void testExportPdf() throws Exception {
        ReportDataResponse report = ReportDataResponse.builder()
                .reportType(ReportType.SALES)
                .title("Sales & Revenue Ledger Report")
                .businessName("Apex Coffee Co.")
                .currency("INR")
                .startDate(LocalDate.now().minusDays(7))
                .endDate(LocalDate.now())
                .generatedAt(LocalDateTime.now())
                .summaryCards(List.of())
                .columns(List.of())
                .rows(List.of())
                .totalRows(0)
                .build();

        byte[] fakePdf = "%PDF-1.4 Fake PDF Content".getBytes();

        when(reportDataService.generateReportData(any())).thenReturn(report);
        when(pdfExportService.generatePdfReport(any())).thenReturn(fakePdf);

        mockMvc.perform(get("/api/v1/reports/export/pdf")
                        .param("reportType", "SALES"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().exists("Content-Disposition"))
                .andExpect(content().bytes(fakePdf));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void testExportExcel() throws Exception {
        ReportDataResponse report = ReportDataResponse.builder()
                .reportType(ReportType.SALES)
                .title("Sales & Revenue Ledger Report")
                .businessName("Apex Coffee Co.")
                .currency("INR")
                .startDate(LocalDate.now().minusDays(7))
                .endDate(LocalDate.now())
                .generatedAt(LocalDateTime.now())
                .summaryCards(List.of())
                .columns(List.of())
                .rows(List.of())
                .totalRows(0)
                .build();

        byte[] fakeExcel = "Fake XLSX Binary".getBytes();

        when(reportDataService.generateReportData(any())).thenReturn(report);
        when(excelExportService.generateExcelReport(any())).thenReturn(fakeExcel);

        mockMvc.perform(get("/api/v1/reports/export/excel")
                        .param("reportType", "SALES"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .andExpect(header().exists("Content-Disposition"))
                .andExpect(content().bytes(fakeExcel));
    }
}
