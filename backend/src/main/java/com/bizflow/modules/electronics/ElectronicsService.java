package com.bizflow.modules.electronics;

import com.bizflow.business.Business;
import com.bizflow.business.BusinessRepository;
import com.bizflow.common.exception.ResourceNotFoundException;
import com.bizflow.modules.electronics.ElectronicsDtos.*;
import com.bizflow.product.Product;
import com.bizflow.product.ProductRepository;
import com.bizflow.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ElectronicsService {

    private final DeviceSerialItemRepository deviceRepository;
    private final BusinessRepository businessRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<DeviceSerialDto> getDevices(String search) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        List<DeviceSerialItem> list;
        if (search != null && !search.trim().isEmpty()) {
            list = deviceRepository.searchDevices(businessId, search.trim());
        } else {
            list = deviceRepository.findByBusinessIdOrderByCreatedAtDesc(businessId);
        }
        return list.stream().map(this::mapDeviceToDto).collect(Collectors.toList());
    }

    @Transactional
    public DeviceSerialDto registerDevice(CreateDeviceSerialRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        Product product = null;
        if (request.getProductId() != null) {
            product = productRepository.findByIdAndBusinessId(request.getProductId(), businessId).orElse(null);
        }

        LocalDate pDate = request.getPurchaseDate() != null
                ? LocalDate.parse(request.getPurchaseDate())
                : LocalDate.now();

        int months = request.getWarrantyMonths() != null ? request.getWarrantyMonths() : 12;
        LocalDate expiryDate = pDate.plusMonths(months);

        String status = "ACTIVE";
        long daysRem = ChronoUnit.DAYS.between(LocalDate.now(), expiryDate);
        if (daysRem < 0) {
            status = "EXPIRED";
        } else if (daysRem <= 30) {
            status = "EXPIRING_SOON";
        }

        DeviceSerialItem item = DeviceSerialItem.builder()
                .business(business)
                .product(product)
                .productName(request.getProductName() != null ? request.getProductName().trim() : (product != null ? product.getName() : "Electronic Device"))
                .brand(request.getBrand() != null ? request.getBrand().trim() : "")
                .model(request.getModel() != null ? request.getModel().trim() : "")
                .serialNumber(request.getSerialNumber().trim())
                .imeiNumber(request.getImeiNumber() != null ? request.getImeiNumber().trim() : "")
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .customerEmail(request.getCustomerEmail())
                .invoiceNumber(request.getInvoiceNumber())
                .purchaseDate(pDate)
                .warrantyMonths(months)
                .warrantyStartDate(pDate)
                .warrantyExpiryDate(expiryDate)
                .warrantyStatus(status)
                .warrantyProvider(request.getWarrantyProvider() != null ? request.getWarrantyProvider().trim() : "Brand Manufacturer")
                .notes(request.getNotes())
                .build();

        return mapDeviceToDto(deviceRepository.save(item));
    }

    @Transactional(readOnly = true)
    public WarrantyLookupResult lookupWarranty(String code) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        if (code == null || code.trim().isEmpty()) {
            return WarrantyLookupResult.builder().found(false).message("Please provide a Serial Number or IMEI").build();
        }

        return deviceRepository.findBySerialOrImei(businessId, code.trim())
                .map(device -> WarrantyLookupResult.builder()
                        .found(true)
                        .device(mapDeviceToDto(device))
                        .message("Device record and warranty found.")
                        .build())
                .orElse(WarrantyLookupResult.builder()
                        .found(false)
                        .message("No device found matching Serial / IMEI: " + code.trim())
                        .build());
    }

    @Transactional
    public void deleteDevice(Long id) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        DeviceSerialItem item = deviceRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Device record not found"));
        deviceRepository.delete(item);
    }

    private DeviceSerialDto mapDeviceToDto(DeviceSerialItem item) {
        long daysRem = ChronoUnit.DAYS.between(LocalDate.now(), item.getWarrantyExpiryDate());
        String status = item.getWarrantyStatus();
        if (daysRem < 0 && !"VOID".equalsIgnoreCase(status)) {
            status = "EXPIRED";
        } else if (daysRem <= 30 && daysRem >= 0 && !"VOID".equalsIgnoreCase(status)) {
            status = "EXPIRING_SOON";
        }

        return DeviceSerialDto.builder()
                .id(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProductName())
                .brand(item.getBrand())
                .model(item.getModel())
                .serialNumber(item.getSerialNumber())
                .imeiNumber(item.getImeiNumber())
                .customerName(item.getCustomerName())
                .customerPhone(item.getCustomerPhone())
                .customerEmail(item.getCustomerEmail())
                .invoiceNumber(item.getInvoiceNumber())
                .purchaseDate(item.getPurchaseDate())
                .warrantyMonths(item.getWarrantyMonths())
                .warrantyStartDate(item.getWarrantyStartDate())
                .warrantyExpiryDate(item.getWarrantyExpiryDate())
                .warrantyStatus(status)
                .daysRemaining(Math.max(daysRem, 0))
                .warrantyProvider(item.getWarrantyProvider())
                .notes(item.getNotes())
                .createdAt(item.getCreatedAt())
                .build();
    }
}
