package com.bizflow.product.service;

import com.bizflow.business.Business;
import com.bizflow.business.BusinessRepository;
import com.bizflow.common.exception.DuplicateResourceException;
import com.bizflow.common.exception.ResourceNotFoundException;
import com.bizflow.product.Category;
import com.bizflow.product.CategoryRepository;
import com.bizflow.product.dto.CategoryRequest;
import com.bizflow.product.dto.CategoryResponse;
import com.bizflow.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final BusinessRepository businessRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories(boolean activeOnly) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        List<Category> categories = activeOnly
                ? categoryRepository.findByBusinessIdAndActiveTrue(businessId)
                : categoryRepository.findByBusinessId(businessId);

        return categories.stream().map(CategoryResponse::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Category category = categoryRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        return CategoryResponse.fromEntity(category);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        String name = request.getName().trim();

        if (categoryRepository.existsByBusinessIdAndNameIgnoreCase(businessId, name)) {
            throw new DuplicateResourceException("Category", "name", name);
        }

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", "id", businessId));

        Category category = Category.builder()
                .business(business)
                .name(name)
                .description(request.getDescription())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        Category saved = categoryRepository.save(category);
        log.info("Category '{}' created for business {}", name, businessId);
        return CategoryResponse.fromEntity(saved);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Category category = categoryRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        String name = request.getName().trim();
        if (categoryRepository.existsByBusinessIdAndNameIgnoreCaseAndIdNot(businessId, name, id)) {
            throw new DuplicateResourceException("Category", "name", name);
        }

        category.setName(name);
        category.setDescription(request.getDescription());
        if (request.getActive() != null) {
            category.setActive(request.getActive());
        }

        Category updated = categoryRepository.save(category);
        log.info("Category {} updated for business {}", id, businessId);
        return CategoryResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Category category = categoryRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        categoryRepository.delete(category);
        log.info("Category {} deleted for business {}", id, businessId);
    }
}
