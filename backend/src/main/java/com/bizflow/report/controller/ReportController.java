package com.bizflow.report.controller;

import com.bizflow.common.api.ApiResponse;
import com.bizflow.payment.PaymentMethod;
import com.bizflow.report.dto.ReportDataResponse;
import com.bizflow.report.dto.ReportFilterRequest;
import com.bizflow.report.dto.ReportType;
import com.bizflow.report.service.ExcelExportService;
import com.bizflow.report.service.PdfExportService;
import com.bizflow.report.service.ReportDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Business Reports, In-Browser Data Previews, and PDF/Excel Exports")
@SecurityRequirement(name = "bearerAuth")
public class ReportController {

    private final ReportDataService reportDataService;
    private final PdfExportService pdfExportService;
    private final ExcelExportService excelExportService;

    @PostMapping("/preview")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Generate interactive report preview data for browser display")
    public ResponseEntity<ApiResponse<ReportDataResponse>> previewReport(
            @RequestBody ReportFilterRequest filter
    ) {
        ReportDataResponse report = reportDataService.generateReportData(filter);
        return ResponseEntity.ok(ApiResponse.ok("Report generated successfully", report));
    }

    @GetMapping("/export/pdf")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Export styled PDF document of the specified report")
    public ResponseEntity<byte[]> exportPdf(
            @RequestParam(required = false, defaultValue = "SALES") ReportType reportType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) PaymentMethod paymentMethod,
            @RequestParam(required = false) String search
    ) {
        ReportFilterRequest filter = ReportFilterRequest.builder()
                .reportType(reportType)
                .startDate(startDate)
                .endDate(endDate)
                .locationId(locationId)
                .categoryId(categoryId)
                .paymentMethod(paymentMethod)
                .search(search)
                .build();

        ReportDataResponse report = reportDataService.generateReportData(filter);
        byte[] pdfBytes = pdfExportService.generatePdfReport(report);

        String filename = String.format("bizflow-%s-report-%s.pdf",
                reportType.name().toLowerCase(),
                LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/export/excel")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Export styled Excel (.xlsx) spreadsheet of the specified report")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam(required = false, defaultValue = "SALES") ReportType reportType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) PaymentMethod paymentMethod,
            @RequestParam(required = false) String search
    ) {
        ReportFilterRequest filter = ReportFilterRequest.builder()
                .reportType(reportType)
                .startDate(startDate)
                .endDate(endDate)
                .locationId(locationId)
                .categoryId(categoryId)
                .paymentMethod(paymentMethod)
                .search(search)
                .build();

        ReportDataResponse report = reportDataService.generateReportData(filter);
        byte[] excelBytes = excelExportService.generateExcelReport(report);

        String filename = String.format("bizflow-%s-report-%s.xlsx",
                reportType.name().toLowerCase(),
                LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }
}
