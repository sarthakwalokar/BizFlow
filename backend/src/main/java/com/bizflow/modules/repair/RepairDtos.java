package com.bizflow.modules.repair;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public class RepairDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobCardDto {
        private Long id;
        private String jobCardNumber;
        private String customerName;
        private String customerPhone;
        private String customerEmail;
        private String itemType;
        private String brand;
        private String model;
        private String serialOrImei;
        private String problemDescription;
        private String diagnosticNotes;
        private String workPerformed;
        private BigDecimal partsCost;
        private BigDecimal labourCost;
        private BigDecimal totalEstimatedCost;
        private BigDecimal totalFinalCost;
        private String assignedTechnician;
        private String status; // RECEIVED, DIAGNOSING, REPAIRING, READY, DELIVERED, CANCELLED
        private String priority; // LOW, NORMAL, HIGH, URGENT
        private LocalDate estimatedCompletionDate;
        private Instant deliveryDate;
        private String paymentStatus;
        private Instant createdAt;
        private Instant updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateJobCardRequest {
        private String customerName;
        private String customerPhone;
        private String customerEmail;
        private String itemType;
        private String brand;
        private String model;
        private String serialOrImei;
        private String problemDescription;
        private String diagnosticNotes;
        private BigDecimal totalEstimatedCost;
        private String assignedTechnician;
        private String priority;
        private String estimatedCompletionDate; // YYYY-MM-DD
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateJobCardRequest {
        private String diagnosticNotes;
        private String workPerformed;
        private BigDecimal partsCost;
        private BigDecimal labourCost;
        private BigDecimal totalFinalCost;
        private String assignedTechnician;
        private String status;
        private String priority;
        private String paymentStatus;
    }
}
