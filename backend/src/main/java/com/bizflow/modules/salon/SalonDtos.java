package com.bizflow.modules.salon;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public class SalonDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceItemDto {
        private Long id;
        private String name;
        private String category;
        private Integer durationMinutes;
        private BigDecimal price;
        private String description;
        private Boolean isActive;
        private Instant createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateServiceRequest {
        private String name;
        private String category;
        private Integer durationMinutes;
        private BigDecimal price;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AppointmentDto {
        private Long id;
        private Long customerId;
        private String customerName;
        private String customerPhone;
        private Long serviceId;
        private String serviceName;
        private String staffName;
        private LocalDate appointmentDate;
        private String startTime;
        private String endTime;
        private Integer durationMinutes;
        private BigDecimal price;
        private String status;
        private String notes;
        private Instant createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateAppointmentRequest {
        private Long customerId;
        private String customerName;
        private String customerPhone;
        private Long serviceId;
        private String serviceName;
        private String staffName;
        private String appointmentDate; // YYYY-MM-DD
        private String startTime;
        private String endTime;
        private Integer durationMinutes;
        private BigDecimal price;
        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateAppointmentStatusRequest {
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerServiceHistoryDto {
        private String customerName;
        private String customerPhone;
        private Integer totalAppointments;
        private BigDecimal totalSpent;
        private List<AppointmentDto> pastAppointments;
    }
}
