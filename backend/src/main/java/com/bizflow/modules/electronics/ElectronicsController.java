package com.bizflow.modules.electronics;

import com.bizflow.common.api.ApiResponse;
import com.bizflow.modules.electronics.ElectronicsDtos.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/electronics")
@RequiredArgsConstructor
@Tag(name = "Electronics Module", description = "Serial / IMEI Tracking and Warranty Management APIs")
@SecurityRequirement(name = "bearerAuth")
public class ElectronicsController {

    private final ElectronicsService electronicsService;

    @GetMapping("/devices")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get all registered devices with serials / IMEI")
    public ResponseEntity<ApiResponse<List<DeviceSerialDto>>> getDevices(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.ok("Devices retrieved", electronicsService.getDevices(search)));
    }

    @PostMapping("/devices")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Register device with serial / IMEI and warranty")
    public ResponseEntity<ApiResponse<DeviceSerialDto>> registerDevice(@RequestBody CreateDeviceSerialRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Device registered", electronicsService.registerDevice(request)));
    }

    @GetMapping("/warranty-lookup")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Lookup warranty details by Serial Number or IMEI")
    public ResponseEntity<ApiResponse<WarrantyLookupResult>> lookupWarranty(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String code) {
        String searchTerm = (query != null && !query.trim().isEmpty()) ? query : code;
        return ResponseEntity.ok(ApiResponse.ok("Warranty search result", electronicsService.lookupWarranty(searchTerm)));
    }

    @DeleteMapping("/devices/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Delete device serial record")
    public ResponseEntity<ApiResponse<Void>> deleteDevice(@PathVariable Long id) {
        electronicsService.deleteDevice(id);
        return ResponseEntity.ok(ApiResponse.ok("Device deleted", null));
    }
}
