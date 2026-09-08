package com.bizflow.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    @Query("SELECT p FROM Product p WHERE p.business.id = :businessId")
    List<Product> findByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT p FROM Product p WHERE p.business.id = :businessId ORDER BY p.name ASC")
    List<Product> findByBusinessIdOrderByNameAsc(@Param("businessId") Long businessId);

    @Query("SELECT p FROM Product p WHERE p.business.id = :businessId AND p.active = true")
    List<Product> findByBusinessIdAndActiveTrue(@Param("businessId") Long businessId);

    @Query("SELECT p FROM Product p WHERE p.id = :id AND p.business.id = :businessId")
    Optional<Product> findByIdAndBusinessId(@Param("id") Long id, @Param("businessId") Long businessId);

    @Query("SELECT p FROM Product p WHERE p.business.id = :businessId AND p.category.id = :categoryId")
    List<Product> findByBusinessIdAndCategoryId(@Param("businessId") Long businessId, @Param("categoryId") Long categoryId);

    @Query("SELECT p FROM Product p WHERE p.business.id = :businessId AND p.productType = :productType")
    List<Product> findByBusinessIdAndProductType(@Param("businessId") Long businessId, @Param("productType") ProductType productType);

    @Query("SELECT COUNT(p) > 0 FROM Product p WHERE p.business.id = :businessId AND LOWER(p.sku) = LOWER(:sku)")
    boolean existsByBusinessIdAndSkuIgnoreCase(@Param("businessId") Long businessId, @Param("sku") String sku);

    @Query("SELECT COUNT(p) > 0 FROM Product p WHERE p.business.id = :businessId AND LOWER(p.sku) = LOWER(:sku) AND p.id != :id")
    boolean existsByBusinessIdAndSkuIgnoreCaseAndIdNot(@Param("businessId") Long businessId, @Param("sku") String sku, @Param("id") Long id);

    @Query("SELECT p FROM Product p WHERE p.business.id = :businessId " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:productType IS NULL OR p.productType = :productType) " +
           "AND (:active IS NULL OR p.active = :active) " +
           "AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Product> searchProducts(
            @Param("businessId") Long businessId,
            @Param("categoryId") Long categoryId,
            @Param("productType") ProductType productType,
            @Param("active") Boolean active,
            @Param("search") String search
    );
}
