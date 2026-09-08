package com.bizflow.analytics.controller;

import com.bizflow.analytics.dto.AnalyticsOverviewResponse;
import com.bizflow.analytics.dto.TimeRange;
import com.bizflow.analytics.service.AnalyticsService;
import com.bizflow.common.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Business Analytics, Financial Trends, and Branch Performance APIs")
@SecurityRequirement(name = "bearerAuth")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/overview")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get comprehensive business analytics and visual charts overview")
    public ResponseEntity<ApiResponse<AnalyticsOverviewResponse>> getOverview(
            @RequestParam(required = false, defaultValue = "THIS_MONTH") TimeRange timeRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long locationId
    ) {
        AnalyticsOverviewResponse response = analyticsService.getOverview(
                timeRange,
                startDate,
                endDate,
                locationId
        );
        return ResponseEntity.ok(ApiResponse.ok("Analytics overview fetched successfully", response));
    }
}
