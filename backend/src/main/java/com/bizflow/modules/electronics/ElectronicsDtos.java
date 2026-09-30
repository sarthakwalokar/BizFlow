package com.bizflow.modules.electronics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

public class ElectronicsDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeviceSerialDto {
        private Long id;
        private Long productId;
        private String productName;
        private String brand;
        private String model;
        private String serialNumber;
        private String imeiNumber;
        private String customerName;
        private String customerPhone;
        private String customerEmail;
        private String invoiceNumber;
        private LocalDate purchaseDate;
        private Integer warrantyMonths;
        private LocalDate warrantyStartDate;
        private LocalDate warrantyExpiryDate;
        private String warrantyStatus; // ACTIVE, EXPIRING_SOON, EXPIRED, VOID
        private Long daysRemaining;
        private String warrantyProvider;
        private String notes;
        private Instant createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateDeviceSerialRequest {
        private Long productId;
        private String productName;
        private String brand;
        private String model;
        private String serialNumber;
        private String imeiNumber;
        private String customerName;
        private String customerPhone;
        private String customerEmail;
        private String invoiceNumber;
        private String purchaseDate; // YYYY-MM-DD
        private Integer warrantyMonths;
        private String warrantyProvider;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WarrantyLookupResult {
        private boolean found;
        private DeviceSerialDto device;
        private String message;
    }
}
