package com.bizflow.modules.electronics;

import com.bizflow.business.Business;
import com.bizflow.common.entity.BaseEntity;
import com.bizflow.product.Product;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "device_serial_items")
public class DeviceSerialItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "product_name", nullable = false, length = 150)
    private String productName;

    @Column(name = "brand", length = 100)
    private String brand;

    @Column(name = "model", length = 100)
    private String model;

    @Column(name = "serial_number", nullable = false, length = 100)
    private String serialNumber;

    @Column(name = "imei_number", length = 100)
    private String imeiNumber;

    @Column(name = "customer_name", length = 150)
    private String customerName;

    @Column(name = "customer_phone", length = 50)
    private String customerPhone;

    @Column(name = "customer_email", length = 150)
    private String customerEmail;

    @Column(name = "customer_address", columnDefinition = "TEXT")
    private String customerAddress;

    @Column(name = "invoice_number", length = 100)
    private String invoiceNumber;

    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate;

    @Column(name = "warranty_months", nullable = false)
    private Integer warrantyMonths;

    @Column(name = "warranty_start_date", nullable = false)
    private LocalDate warrantyStartDate;

    @Column(name = "warranty_expiry_date", nullable = false)
    private LocalDate warrantyExpiryDate;

    @Column(name = "warranty_status", nullable = false, length = 30)
    private String warrantyStatus; // ACTIVE, EXPIRING_SOON, EXPIRED, VOID

    @Column(name = "warranty_provider", length = 100)
    private String warrantyProvider;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
