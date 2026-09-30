package com.bizflow.modules.salon;

import com.bizflow.common.api.ApiResponse;
import com.bizflow.modules.salon.SalonDtos.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/salon")
@RequiredArgsConstructor
@Tag(name = "Salon Module", description = "Appointments, Services, Calendar and Customer History APIs")
@SecurityRequirement(name = "bearerAuth")
public class SalonController {

    private final SalonService salonService;

    @GetMapping("/services")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get all salon services")
    public ResponseEntity<ApiResponse<List<ServiceItemDto>>> getServices() {
        return ResponseEntity.ok(ApiResponse.ok("Services retrieved", salonService.getServices()));
    }

    @PostMapping("/services")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Create salon service")
    public ResponseEntity<ApiResponse<ServiceItemDto>> createService(@RequestBody CreateServiceRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Service created", salonService.createService(request)));
    }

    @PutMapping("/services/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Update salon service")
    public ResponseEntity<ApiResponse<ServiceItemDto>> updateService(@PathVariable Long id, @RequestBody CreateServiceRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Service updated", salonService.updateService(id, request)));
    }

    @DeleteMapping("/services/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Delete salon service")
    public ResponseEntity<ApiResponse<Void>> deleteService(@PathVariable Long id) {
        salonService.deleteService(id);
        return ResponseEntity.ok(ApiResponse.ok("Service deleted", null));
    }

    @GetMapping("/appointments")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get appointments with date filter")
    public ResponseEntity<ApiResponse<List<AppointmentDto>>> getAppointments(
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return ResponseEntity.ok(ApiResponse.ok("Appointments retrieved", salonService.getAppointments(date, startDate, endDate)));
    }

    @PostMapping("/appointments")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Book a new appointment")
    public ResponseEntity<ApiResponse<AppointmentDto>> createAppointment(@RequestBody CreateAppointmentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Appointment booked", salonService.createAppointment(request)));
    }

    @PutMapping("/appointments/{id}/status")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Update appointment status")
    public ResponseEntity<ApiResponse<AppointmentDto>> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestBody UpdateAppointmentStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Status updated", salonService.updateAppointmentStatus(id, request.getStatus())));
    }

    @GetMapping("/customer-history")
    @PreAuthorize("hasAnyRole('OWNER', 'STAFF')")
    @Operation(summary = "Get customer past salon visits and service history")
    public ResponseEntity<ApiResponse<CustomerServiceHistoryDto>> getCustomerHistory(@RequestParam String phone) {
        return ResponseEntity.ok(ApiResponse.ok("Customer history retrieved", salonService.getCustomerHistory(phone)));
    }
}
