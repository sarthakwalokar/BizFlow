package com.bizflow.inventory.service;

import com.bizflow.business.Business;
import com.bizflow.business.BusinessRepository;
import com.bizflow.business.BusinessSize;
import com.bizflow.common.api.PageResponse;
import com.bizflow.common.exception.BadRequestException;
import com.bizflow.common.exception.ResourceNotFoundException;
import com.bizflow.inventory.*;
import com.bizflow.inventory.dto.*;
import com.bizflow.inventory.repository.*;
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
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final ProductRepository productRepository;
    private final BusinessRepository businessRepository;
    private final LocationRepository locationRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseRepository purchaseRepository;
    private final LocationInventoryRepository locationInventoryRepository;
    private final StockMovementRepository stockMovementRepository;

    @Transactional(readOnly = true)
    public InventorySummaryResponse getInventorySummary() {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", "id", businessId));

        List<Product> allProducts = productRepository.findByBusinessId(businessId);
        List<Product> trackedProducts = allProducts.stream().filter(Product::isTrackStock).toList();

        long totalTracked = trackedProducts.size();
        long inStock = 0;
        long lowStock = 0;
        long outOfStock = 0;
        BigDecimal totalCostValuation = BigDecimal.ZERO;
        BigDecimal totalRetailValuation = BigDecimal.ZERO;

        for (Product p : trackedProducts) {
            int qty = p.getStockQuantity() != null ? p.getStockQuantity() : 0;
            int threshold = p.getLowStockThreshold() != null ? p.getLowStockThreshold() : 5;

            if (qty <= 0) {
                outOfStock++;
            } else if (qty <= threshold) {
                lowStock++;
            } else {
                inStock++;
            }

            if (qty > 0) {
                if (p.getCostPrice() != null && p.getCostPrice().compareTo(BigDecimal.ZERO) > 0) {
                    totalCostValuation = totalCostValuation.add(p.getCostPrice().multiply(BigDecimal.valueOf(qty)));
                } else if (p.getPrice() != null) {
                    totalCostValuation = totalCostValuation.add(p.getPrice().multiply(BigDecimal.valueOf(qty)));
                }

                if (p.getPrice() != null) {
                    totalRetailValuation = totalRetailValuation.add(p.getPrice().multiply(BigDecimal.valueOf(qty)));
                }
            }
        }

        long locationsCount = locationRepository.countByBusinessIdAndActiveTrue(businessId);
        long suppliersCount = supplierRepository.countByBusinessIdAndActiveTrue(businessId);
        long purchasesCount = purchaseRepository.countByBusinessId(businessId);
        BigDecimal totalPurchaseSpend = purchaseRepository.sumTotalPurchaseSpend(businessId);

        List<StockMovement> recentMovementsEntities = stockMovementRepository.findTop10ByBusinessIdOrderByCreatedAtDesc(businessId);
        List<StockMovementResponse> recentMovements = recentMovementsEntities.stream()
                .map(StockMovementResponse::fromEntity)
                .toList();

        return InventorySummaryResponse.builder()
                .businessSize(business.getBusinessSize() != null ? business.getBusinessSize() : BusinessSize.SMALL)
                .inventoryEnabled(business.isInventoryEnabled())
                .totalTrackedProducts(totalTracked)
                .inStockProducts(inStock)
                .lowStockProducts(lowStock)
                .outOfStockProducts(outOfStock)
                .totalInventoryValuation(totalCostValuation)
                .totalRetailValuation(totalRetailValuation)
                .totalLocationsCount(locationsCount)
                .totalSuppliersCount(suppliersCount)
                .totalPurchasesCount(purchasesCount)
                .totalPurchaseSpend(totalPurchaseSpend != null ? totalPurchaseSpend : BigDecimal.ZERO)
                .currency(business.getCurrency() != null ? business.getCurrency() : "INR")
                .recentMovements(recentMovements)
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<StockItemResponse> getStockList(
            String search,
            Long categoryId,
            Boolean lowStockOnly,
            int page,
            int size) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", "id", businessId));

        boolean isLarge = business.getBusinessSize() == BusinessSize.LARGE;
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "name"));

        // Fetch products
        Page<Product> productPage = productRepository.findAll((root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("business").get("id"), businessId));

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (Boolean.TRUE.equals(lowStockOnly)) {
                predicates.add(cb.isTrue(root.get("trackStock")));
                predicates.add(cb.lessThanOrEqualTo(root.get("stockQuantity"), root.get("lowStockThreshold")));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                jakarta.persistence.criteria.Predicate nameMatch = cb.like(cb.lower(root.get("name")), pattern);
                jakarta.persistence.criteria.Predicate skuMatch = cb.like(cb.lower(root.get("sku")), pattern);
                predicates.add(cb.or(nameMatch, skuMatch));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        }, pageable);

        List<StockItemResponse> content = productPage.getContent().stream()
                .map(p -> {
                    List<StockItemResponse.LocationStockItem> locStocks = null;
                    if (isLarge) {
                        List<LocationInventory> locInvs = locationInventoryRepository.findByBusinessIdAndProductId(businessId, p.getId());
                        locStocks = locInvs.stream().map(li -> StockItemResponse.LocationStockItem.builder()
                                .locationId(li.getLocation().getId())
                                .locationName(li.getLocation().getName())
                                .locationCode(li.getLocation().getCode())
                                .quantity(li.getQuantity())
                                .lowStockThreshold(li.getLowStockThreshold())
                                .build()).collect(Collectors.toList());
                    }
                    return StockItemResponse.fromProduct(p, locStocks);
                })
                .toList();

        return PageResponse.<StockItemResponse>builder()
                .content(content)
                .pageNumber(productPage.getNumber())
                .pageSize(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .isFirst(productPage.isFirst())
                .isLast(productPage.isLast())
                .build();
    }

    @Transactional
    public StockItemResponse adjustStock(StockAdjustRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        String operator = SecurityUtils.getCurrentUserPrincipal().getFullName();

        Product product = productRepository.findByIdAndBusinessId(request.getProductId(), businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        int previousStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        int newStock;
        int delta;

        if (request.getNewStockQuantity() != null) {
            newStock = request.getNewStockQuantity();
            delta = newStock - previousStock;
        } else if (request.getAdjustmentQuantity() != null) {
            delta = request.getAdjustmentQuantity();
            newStock = previousStock + delta;
        } else {
            throw new BadRequestException("Either newStockQuantity or adjustmentQuantity must be provided.");
        }

        product.setTrackStock(true);
        product.setStockQuantity(newStock);
        Product savedProduct = productRepository.save(product);

        Location location = null;
        if (request.getLocationId() != null) {
            final Location targetLocation = locationRepository.findByIdAndBusinessId(request.getLocationId(), businessId).orElse(null);
            location = targetLocation;
            if (targetLocation != null) {
                LocationInventory locInv = locationInventoryRepository
                        .findByBusinessIdAndLocationIdAndProductId(businessId, targetLocation.getId(), product.getId())
                        .orElseGet(() -> LocationInventory.builder()
                                .business(product.getBusiness())
                                .location(targetLocation)
                                .product(product)
                                .quantity(0)
                                .lowStockThreshold(product.getLowStockThreshold() != null ? product.getLowStockThreshold() : 5)
                                .build());

                locInv.setQuantity(Math.max(0, locInv.getQuantity() + delta));
                locationInventoryRepository.save(locInv);
            }
        }

        // Record stock movement
        StockMovement movement = StockMovement.builder()
                .business(product.getBusiness())
                .product(product)
                .location(location)
                .movementType(MovementType.ADJUSTMENT)
                .quantity(delta)
                .previousStock(previousStock)
                .newStock(newStock)
                .referenceType(ReferenceType.MANUAL_ADJUSTMENT)
                .referenceId(null)
                .referenceNumber("ADJ-" + System.currentTimeMillis() % 100000)
                .notes(request.getNotes() != null && !request.getNotes().isBlank() ? request.getNotes().trim() : "Manual stock level adjustment")
                .createdBy(operator)
                .build();

        stockMovementRepository.save(movement);
        log.info("Stock adjusted for product {} (Delta: {}, New: {}) by {}", product.getId(), delta, newStock, operator);

        List<StockItemResponse.LocationStockItem> locStocks = null;
        List<LocationInventory> locInvs = locationInventoryRepository.findByBusinessIdAndProductId(businessId, product.getId());
        if (!locInvs.isEmpty()) {
            locStocks = locInvs.stream().map(li -> StockItemResponse.LocationStockItem.builder()
                    .locationId(li.getLocation().getId())
                    .locationName(li.getLocation().getName())
                    .locationCode(li.getLocation().getCode())
                    .quantity(li.getQuantity())
                    .lowStockThreshold(li.getLowStockThreshold())
                    .build()).collect(Collectors.toList());
        }

        return StockItemResponse.fromProduct(savedProduct, locStocks);
    }

    @Transactional
    public void transferStock(StockTransferRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        String operator = SecurityUtils.getCurrentUserPrincipal().getFullName();

        if (request.getSourceLocationId().equals(request.getTargetLocationId())) {
            throw new BadRequestException("Source and target locations must be different.");
        }

        Product product = productRepository.findByIdAndBusinessId(request.getProductId(), businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        Location source = locationRepository.findByIdAndBusinessId(request.getSourceLocationId(), businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Source Location", "id", request.getSourceLocationId()));

        Location target = locationRepository.findByIdAndBusinessId(request.getTargetLocationId(), businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Target Location", "id", request.getTargetLocationId()));

        LocationInventory sourceInv = locationInventoryRepository
                .findByBusinessIdAndLocationIdAndProductId(businessId, source.getId(), product.getId())
                .orElseThrow(() -> new BadRequestException("No stock available at source location."));

        if (sourceInv.getQuantity() < request.getQuantity()) {
            throw new BadRequestException("Insufficient stock at source location. Available: " + sourceInv.getQuantity());
        }

        LocationInventory targetInv = locationInventoryRepository
                .findByBusinessIdAndLocationIdAndProductId(businessId, target.getId(), product.getId())
                .orElseGet(() -> LocationInventory.builder()
                        .business(product.getBusiness())
                        .location(target)
                        .product(product)
                        .quantity(0)
                        .lowStockThreshold(product.getLowStockThreshold() != null ? product.getLowStockThreshold() : 5)
                        .build());

        sourceInv.setQuantity(sourceInv.getQuantity() - request.getQuantity());
        targetInv.setQuantity(targetInv.getQuantity() + request.getQuantity());

        locationInventoryRepository.save(sourceInv);
        locationInventoryRepository.save(targetInv);

        int totalStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;

        // Record stock movement (transfer out & in record)
        StockMovement movement = StockMovement.builder()
                .business(product.getBusiness())
                .product(product)
                .location(target)
                .movementType(MovementType.TRANSFER)
                .quantity(request.getQuantity())
                .previousStock(totalStock)
                .newStock(totalStock)
                .referenceType(ReferenceType.TRANSFER)
                .referenceNumber("TRF-" + source.getCode() + "->" + target.getCode())
                .notes("Transferred from " + source.getName() + " to " + target.getName() +
                        (request.getNotes() != null ? " | " + request.getNotes().trim() : ""))
                .createdBy(operator)
                .build();

        stockMovementRepository.save(movement);
        log.info("Transferred {} units of product {} from {} to {} by {}",
                request.getQuantity(), product.getId(), source.getName(), target.getName(), operator);
    }

    @Transactional(readOnly = true)
    public PageResponse<StockMovementResponse> getStockMovements(
            Long productId,
            Long locationId,
            MovementType movementType,
            LocalDate startDate,
            LocalDate endDate,
            int page,
            int size) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Instant startInstant = startDate != null ? startDate.atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        Instant endInstant = endDate != null ? endDate.atTime(LocalTime.MAX).atZone(ZoneOffset.UTC).toInstant() : null;

        Page<StockMovement> movementPage = stockMovementRepository.findAll((root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("business").get("id"), businessId));

            if (productId != null) {
                predicates.add(cb.equal(root.get("product").get("id"), productId));
            }
            if (locationId != null) {
                predicates.add(cb.equal(root.get("location").get("id"), locationId));
            }
            if (movementType != null) {
                predicates.add(cb.equal(root.get("movementType"), movementType));
            }
            if (startInstant != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startInstant));
            }
            if (endInstant != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endInstant));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        }, pageable);

        List<StockMovementResponse> content = movementPage.getContent().stream()
                .map(StockMovementResponse::fromEntity)
                .toList();

        return PageResponse.<StockMovementResponse>builder()
                .content(content)
                .pageNumber(movementPage.getNumber())
                .pageSize(movementPage.getSize())
                .totalElements(movementPage.getTotalElements())
                .totalPages(movementPage.getTotalPages())
                .isFirst(movementPage.isFirst())
                .isLast(movementPage.isLast())
                .build();
    }
}
