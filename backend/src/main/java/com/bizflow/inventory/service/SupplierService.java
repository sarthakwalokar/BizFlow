package com.bizflow.inventory.service;

import com.bizflow.business.Business;
import com.bizflow.business.BusinessRepository;
import com.bizflow.common.api.PageResponse;
import com.bizflow.common.exception.DuplicateResourceException;
import com.bizflow.common.exception.ResourceNotFoundException;
import com.bizflow.inventory.Supplier;
import com.bizflow.inventory.dto.SupplierRequest;
import com.bizflow.inventory.dto.SupplierResponse;
import com.bizflow.inventory.repository.SupplierRepository;
import com.bizflow.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final BusinessRepository businessRepository;

    @Transactional(readOnly = true)
    public List<SupplierResponse> getActiveSuppliers() {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        return supplierRepository.findByBusinessIdAndActiveTrueOrderByNameAsc(businessId)
                .stream()
                .map(SupplierResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<SupplierResponse> searchSuppliers(String search, Boolean active, int page, int size) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "name"));

        Page<Supplier> supplierPage = supplierRepository.findAll((root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            predicates.add(cb.equal(root.get("business").get("id"), businessId));

            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("contactPerson")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern),
                        cb.like(root.get("phone"), "%" + search.trim() + "%")
                ));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        }, pageable);

        List<SupplierResponse> content = supplierPage.getContent().stream()
                .map(SupplierResponse::fromEntity)
                .toList();

        return PageResponse.<SupplierResponse>builder()
                .content(content)
                .pageNumber(supplierPage.getNumber())
                .pageSize(supplierPage.getSize())
                .totalElements(supplierPage.getTotalElements())
                .totalPages(supplierPage.getTotalPages())
                .isFirst(supplierPage.isFirst())
                .isLast(supplierPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public SupplierResponse getSupplierById(Long id) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Supplier supplier = supplierRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));

        return SupplierResponse.fromEntity(supplier);
    }

    @Transactional
    public SupplierResponse createSupplier(SupplierRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        String name = request.getName().trim();

        if (supplierRepository.existsByBusinessIdAndNameIgnoreCase(businessId, name)) {
            throw new DuplicateResourceException("Supplier", "name", name);
        }

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", "id", businessId));

        Supplier supplier = Supplier.builder()
                .business(business)
                .name(name)
                .contactPerson(request.getContactPerson())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .taxNumber(request.getTaxNumber())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        Supplier saved = supplierRepository.save(supplier);
        log.info("Supplier '{}' created for business {}", saved.getName(), businessId);
        return SupplierResponse.fromEntity(saved);
    }

    @Transactional
    public SupplierResponse updateSupplier(Long id, SupplierRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Supplier supplier = supplierRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));

        String name = request.getName().trim();
        if (supplierRepository.existsByBusinessIdAndNameIgnoreCaseAndIdNot(businessId, name, id)) {
            throw new DuplicateResourceException("Supplier", "name", name);
        }

        supplier.setName(name);
        supplier.setContactPerson(request.getContactPerson());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        supplier.setTaxNumber(request.getTaxNumber());
        if (request.getActive() != null) {
            supplier.setActive(request.getActive());
        }

        Supplier updated = supplierRepository.save(supplier);
        log.info("Supplier {} updated for business {}", id, businessId);
        return SupplierResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteSupplier(Long id) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Supplier supplier = supplierRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));

        supplierRepository.delete(supplier);
        log.info("Supplier {} deleted for business {}", id, businessId);
    }
}
