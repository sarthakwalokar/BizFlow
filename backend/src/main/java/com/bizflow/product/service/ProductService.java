package com.bizflow.product.service;

import com.bizflow.business.Business;
import com.bizflow.business.BusinessRepository;
import com.bizflow.common.exception.DuplicateResourceException;
import com.bizflow.common.exception.ResourceNotFoundException;
import com.bizflow.product.Category;
import com.bizflow.product.CategoryRepository;
import com.bizflow.product.Product;
import com.bizflow.product.ProductRepository;
import com.bizflow.product.ProductType;
import com.bizflow.product.dto.ProductRequest;
import com.bizflow.product.dto.ProductResponse;
import com.bizflow.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BusinessRepository businessRepository;

    @Transactional(readOnly = true)
    public List<ProductResponse> searchProducts(
            Long categoryId,
            ProductType productType,
            Boolean active,
            String search) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        List<Product> products = productRepository.findAll((root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            predicates.add(cb.equal(root.get("business").get("id"), businessId));

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (productType != null) {
                predicates.add(cb.equal(root.get("productType"), productType));
            }
            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("sku")), pattern)
                ));
            }

            query.orderBy(cb.asc(root.get("name")));
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        });

        return products.stream().map(ProductResponse::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Product product = productRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        return ProductResponse.fromEntity(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        String sku = request.getSku() != null && !request.getSku().isBlank() ? request.getSku().trim() : null;

        if (sku != null && productRepository.existsByBusinessIdAndSkuIgnoreCase(businessId, sku)) {
            throw new DuplicateResourceException("Product", "SKU", sku);
        }

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", "id", businessId));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findByIdAndBusinessId(request.getCategoryId(), businessId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        }

        Product product = Product.builder()
                .business(business)
                .category(category)
                .name(request.getName().trim())
                .description(request.getDescription())
                .productType(request.getProductType())
                .price(request.getPrice())
                .costPrice(request.getCostPrice())
                .sku(sku)
                .trackStock(request.getTrackStock() != null ? request.getTrackStock() : false)
                .stockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0)
                .lowStockThreshold(request.getLowStockThreshold() != null ? request.getLowStockThreshold() : 5)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        Product saved = productRepository.save(product);
        log.info("Product/Service '{}' ({}) created for business {}", saved.getName(), saved.getProductType(), businessId);
        return ProductResponse.fromEntity(saved);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Product product = productRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        String sku = request.getSku() != null && !request.getSku().isBlank() ? request.getSku().trim() : null;
        if (sku != null && productRepository.existsByBusinessIdAndSkuIgnoreCaseAndIdNot(businessId, sku, id)) {
            throw new DuplicateResourceException("Product", "SKU", sku);
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findByIdAndBusinessId(request.getCategoryId(), businessId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        }

        product.setName(request.getName().trim());
        product.setDescription(request.getDescription());
        product.setCategory(category);
        product.setProductType(request.getProductType());
        product.setPrice(request.getPrice());
        product.setCostPrice(request.getCostPrice());
        product.setSku(sku);
        if (request.getTrackStock() != null) {
            product.setTrackStock(request.getTrackStock());
        }
        if (request.getStockQuantity() != null) {
            product.setStockQuantity(request.getStockQuantity());
        }
        if (request.getLowStockThreshold() != null) {
            product.setLowStockThreshold(request.getLowStockThreshold());
        }
        if (request.getActive() != null) {
            product.setActive(request.getActive());
        }

        Product updated = productRepository.save(product);
        log.info("Product/Service {} updated for business {}", id, businessId);
        return ProductResponse.fromEntity(updated);
    }

    @Transactional
    public ProductResponse updateProductStatus(Long id, boolean active) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Product product = productRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        product.setActive(active);
        Product updated = productRepository.save(product);
        log.info("Product {} active status updated to {} for business {}", id, active, businessId);
        return ProductResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Product product = productRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        productRepository.delete(product);
        log.info("Product {} deleted for business {}", id, businessId);
    }
}
