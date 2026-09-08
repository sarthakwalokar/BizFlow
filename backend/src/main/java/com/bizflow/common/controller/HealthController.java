package com.bizflow.common.controller;

import com.bizflow.common.api.ApiResponse;
import com.bizflow.common.dto.HealthResponse;
import com.bizflow.common.service.HealthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/health")
@RequiredArgsConstructor
@Tag(name = "Health", description = "System health check and diagnostic endpoints")
public class HealthController {

    private final HealthService healthService;

    @GetMapping
    @Operation(summary = "Check System Health", description = "Returns the status of the BizFlow API service and database connectivity")
    public ResponseEntity<ApiResponse<HealthResponse>> checkHealth() {
        HealthResponse healthResponse = healthService.getHealthStatus();
        return ResponseEntity.ok(ApiResponse.success("System is operational", healthResponse));
    }
}
