package com.bizflow.inventory.service;

import com.bizflow.business.Business;
import com.bizflow.business.BusinessRepository;
import com.bizflow.common.api.PageResponse;
import com.bizflow.common.exception.BadRequestException;
import com.bizflow.common.exception.ResourceNotFoundException;
import com.bizflow.inventory.*;
import com.bizflow.inventory.dto.PurchaseItemRequest;
import com.bizflow.inventory.dto.PurchaseRequest;
import com.bizflow.inventory.dto.PurchaseResponse;
import com.bizflow.inventory.repository.LocationInventoryRepository;
import com.bizflow.inventory.repository.LocationRepository;
import com.bizflow.inventory.repository.PurchaseRepository;
import com.bizflow.inventory.repository.StockMovementRepository;
import com.bizflow.inventory.repository.SupplierRepository;
import com.bizflow.payment.PaymentMethod;
import com.bizflow.payment.PaymentStatus;
import com.bizflow.product.Product;
import com.bizflow.product.ProductRepository;
import com.bizflow.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final SupplierRepository supplierRepository;
    private final LocationRepository locationRepository;
    private final ProductRepository productRepository;
    private final LocationInventoryRepository locationInventoryRepository;
    private final StockMovementRepository stockMovementRepository;
    private final BusinessRepository businessRepository;

    private static final SecureRandom RANDOM = new SecureRandom();

    @Transactional
    public PurchaseResponse createPurchase(PurchaseRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        String creatorName = SecurityUtils.getCurrentUserPrincipal().getFullName();
        Long creatorUserId = SecurityUtils.getCurrentUserId();

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", "id", businessId));

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findByIdAndBusinessId(request.getSupplierId(), businessId)
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));
        }

        Location location = null;
        if (request.getLocationId() != null) {
            location = locationRepository.findByIdAndBusinessId(request.getLocationId(), businessId)
                    .orElseThrow(() -> new ResourceNotFoundException("Location", "id", request.getLocationId()));
        } else {
            // Default to primary location if available
            location = locationRepository.findFirstByBusinessIdAndPrimaryTrue(businessId).orElse(null);
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Purchase must contain at least one line item.");
        }

        // Build purchase items and compute total
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<PurchaseItem> purchaseItems = new ArrayList<>();

        for (PurchaseItemRequest itemReq : request.getItems()) {
            int qty = itemReq.getQuantity() != null && itemReq.getQuantity() > 0 ? itemReq.getQuantity() : 1;
            BigDecimal unitCost = itemReq.getUnitCost() != null ? itemReq.getUnitCost() : BigDecimal.ZERO;
            BigDecimal subtotal = unitCost.multiply(BigDecimal.valueOf(qty)).setScale(2, RoundingMode.HALF_UP);
            totalAmount = totalAmount.add(subtotal);

            Product product = null;
            if (itemReq.getProductId() != null) {
                product = productRepository.findByIdAndBusinessId(itemReq.getProductId(), businessId).orElse(null);
            }

            PurchaseItem item = PurchaseItem.builder()
                    .product(product)
                    .productNameSnapshot(itemReq.getProductName().trim())
                    .quantity(qty)
                    .unitCost(unitCost)
                    .subtotal(subtotal)
                    .build();

            purchaseItems.add(item);
        }

        String purchaseNumber = generatePurchaseNumber(businessId);
        PurchaseStatus status = request.getStatus() != null ? request.getStatus() : PurchaseStatus.RECEIVED;

        Purchase purchase = Purchase.builder()
                .business(business)
                .supplier(supplier)
                .location(location)
                .purchaseNumber(purchaseNumber)
                .status(status)
                .totalAmount(totalAmount)
                .paymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus() : PaymentStatus.COMPLETED)
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.CASH)
                .purchaseDate(request.getPurchaseDate() != null ? request.getPurchaseDate() : LocalDate.now())
                .notes(request.getNotes())
                .createdBy(creatorName)
                .createdByUserId(creatorUserId)
                .build();

        for (PurchaseItem item : purchaseItems) {
            purchase.addItem(item);
        }

        Purchase savedPurchase = purchaseRepository.save(purchase);

        // If status is RECEIVED, increase inventory stock atomically
        if (status == PurchaseStatus.RECEIVED) {
            applyInwardStock(savedPurchase, creatorName);
        }

        log.info("Purchase {} (Total: {}) created for business {}", purchaseNumber, totalAmount, businessId);
        return PurchaseResponse.fromEntity(savedPurchase);
    }

    @Transactional
    public PurchaseResponse markPurchaseReceived(Long purchaseId) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        String creatorName = SecurityUtils.getCurrentUserPrincipal().getFullName();

        Purchase purchase = purchaseRepository.findByIdAndBusinessId(purchaseId, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase", "id", purchaseId));

        if (purchase.getStatus() == PurchaseStatus.RECEIVED) {
            throw new BadRequestException("Purchase is already marked as received.");
        }
        if (purchase.getStatus() == PurchaseStatus.CANCELLED) {
            throw new BadRequestException("Cannot receive a cancelled purchase.");
        }

        purchase.setStatus(PurchaseStatus.RECEIVED);
        Purchase updated = purchaseRepository.save(purchase);

        applyInwardStock(updated, creatorName);
        log.info("Purchase {} marked as RECEIVED for business {}", updated.getPurchaseNumber(), businessId);
        return PurchaseResponse.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public PageResponse<PurchaseResponse> searchPurchases(
            PurchaseStatus status,
            Long supplierId,
            Long locationId,
            LocalDate startDate,
            LocalDate endDate,
            String search,
            int page,
            int size) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "purchaseDate", "createdAt"));

        Page<Purchase> purchasePage = purchaseRepository.findAll((root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            predicates.add(cb.equal(root.get("business").get("id"), businessId));

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (supplierId != null) {
                predicates.add(cb.equal(root.get("supplier").get("id"), supplierId));
            }
            if (locationId != null) {
                predicates.add(cb.equal(root.get("location").get("id"), locationId));
            }
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("purchaseDate"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("purchaseDate"), endDate));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("purchaseNumber")), pattern),
                        cb.like(cb.lower(root.join("supplier", jakarta.persistence.criteria.JoinType.LEFT).get("name")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        }, pageable);

        List<PurchaseResponse> content = purchasePage.getContent().stream()
                .map(PurchaseResponse::fromEntity)
                .toList();

        return PageResponse.<PurchaseResponse>builder()
                .content(content)
                .pageNumber(purchasePage.getNumber())
                .pageSize(purchasePage.getSize())
                .totalElements(purchasePage.getTotalElements())
                .totalPages(purchasePage.getTotalPages())
                .isFirst(purchasePage.isFirst())
                .isLast(purchasePage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public PurchaseResponse getPurchaseById(Long id) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Purchase purchase = purchaseRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase", "id", id));

        return PurchaseResponse.fromEntity(purchase);
    }

    @Transactional
    public PurchaseResponse cancelPurchase(Long id, String reason) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        String operator = SecurityUtils.getCurrentUserPrincipal().getFullName();

        Purchase purchase = purchaseRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase", "id", id));

        if (purchase.getStatus() == PurchaseStatus.CANCELLED) {
            throw new BadRequestException("Purchase is already cancelled.");
        }

        boolean wasReceived = purchase.getStatus() == PurchaseStatus.RECEIVED;
        purchase.setStatus(PurchaseStatus.CANCELLED);
        if (reason != null && !reason.isBlank()) {
            String existingNotes = purchase.getNotes() != null ? purchase.getNotes() + " | " : "";
            purchase.setNotes(existingNotes + "Cancelled: " + reason.trim());
        }

        Purchase saved = purchaseRepository.save(purchase);

        // If previously received, reverse the stock addition
        if (wasReceived) {
            for (PurchaseItem item : purchase.getItems()) {
                Product product = item.getProduct();
                if (product != null) {
                    int prevStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                    int newStock = prevStock - item.getQuantity();
                    product.setStockQuantity(newStock);
                    productRepository.save(product);

                    if (purchase.getLocation() != null) {
                        locationInventoryRepository.findByBusinessIdAndLocationIdAndProductId(
                                businessId, purchase.getLocation().getId(), product.getId()
                        ).ifPresent(locInv -> {
                            locInv.setQuantity(locInv.getQuantity() - item.getQuantity());
                            locationInventoryRepository.save(locInv);
                        });
                    }

                    StockMovement movement = StockMovement.builder()
                            .business(purchase.getBusiness())
                            .product(product)
                            .location(purchase.getLocation())
                            .movementType(MovementType.RETURN)
                            .quantity(-item.getQuantity())
                            .previousStock(prevStock)
                            .newStock(newStock)
                            .referenceType(ReferenceType.PURCHASE)
                            .referenceId(purchase.getId())
                            .referenceNumber(purchase.getPurchaseNumber())
                            .notes("Purchase cancelled reversal")
                            .createdBy(operator)
                            .build();

                    stockMovementRepository.save(movement);
                }
            }
        }

        log.info("Purchase {} cancelled for business {}", id, businessId);
        return PurchaseResponse.fromEntity(saved);
    }

    private void applyInwardStock(Purchase purchase, String createdBy) {
        Long businessId = purchase.getBusinessId();
        Location location = purchase.getLocation();

        for (PurchaseItem item : purchase.getItems()) {
            Product product = item.getProduct();
            if (product != null) {
                int prevStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                int addedQty = item.getQuantity();
                int newStock = prevStock + addedQty;

                product.setTrackStock(true);
                product.setStockQuantity(newStock);
                if (item.getUnitCost() != null && item.getUnitCost().compareTo(BigDecimal.ZERO) > 0) {
                    product.setCostPrice(item.getUnitCost());
                }
                productRepository.save(product);

                // Update location inventory if location configured
                if (location != null) {
                    LocationInventory locInv = locationInventoryRepository
                            .findByBusinessIdAndLocationIdAndProductId(businessId, location.getId(), product.getId())
                            .orElseGet(() -> LocationInventory.builder()
                                    .business(purchase.getBusiness())
                                    .location(location)
                                    .product(product)
                                    .quantity(0)
                                    .lowStockThreshold(product.getLowStockThreshold() != null ? product.getLowStockThreshold() : 5)
                                    .build());

                    locInv.setQuantity(locInv.getQuantity() + addedQty);
                    locationInventoryRepository.save(locInv);
                }

                // Record stock movement
                StockMovement movement = StockMovement.builder()
                        .business(purchase.getBusiness())
                        .product(product)
                        .location(location)
                        .movementType(MovementType.PURCHASE)
                        .quantity(addedQty)
                        .previousStock(prevStock)
                        .newStock(newStock)
                        .referenceType(ReferenceType.PURCHASE)
                        .referenceId(purchase.getId())
                        .referenceNumber(purchase.getPurchaseNumber())
                        .notes("Inward goods receipt from PO " + purchase.getPurchaseNumber())
                        .createdBy(createdBy)
                        .build();

                stockMovementRepository.save(movement);
            }
        }
    }

    private String generatePurchaseNumber(Long businessId) {
        String datePart = DateTimeFormatter.ofPattern("yyyyMMdd").format(LocalDate.now());
        for (int attempt = 0; attempt < 5; attempt++) {
            int randomSuffix = 1000 + RANDOM.nextInt(9000);
            String candidate = "PO-" + datePart + "-" + randomSuffix;
            if (!purchaseRepository.existsByBusinessIdAndPurchaseNumber(businessId, candidate)) {
                return candidate;
            }
        }
        return "PO-" + datePart + "-" + System.currentTimeMillis() % 100000;
    }
}
