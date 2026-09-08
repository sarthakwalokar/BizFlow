package com.bizflow.inventory.repository;

import com.bizflow.inventory.Purchase;
import com.bizflow.inventory.PurchaseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long>, JpaSpecificationExecutor<Purchase> {

    @Query("SELECT p FROM Purchase p WHERE p.id = :id AND p.business.id = :businessId")
    Optional<Purchase> findByIdAndBusinessId(@Param("id") Long id, @Param("businessId") Long businessId);

    @Query("SELECT COUNT(p) > 0 FROM Purchase p WHERE p.business.id = :businessId AND p.purchaseNumber = :purchaseNumber")
    boolean existsByBusinessIdAndPurchaseNumber(@Param("businessId") Long businessId, @Param("purchaseNumber") String purchaseNumber);

    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM Purchase p WHERE p.business.id = :businessId AND p.status = 'RECEIVED'")
    BigDecimal sumTotalPurchaseSpend(@Param("businessId") Long businessId);

    @Query("SELECT COUNT(p) FROM Purchase p WHERE p.business.id = :businessId")
    long countByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT p FROM Purchase p WHERE p.business.id = :businessId AND " +
            "(:status IS NULL OR p.status = :status) AND " +
            "(:supplierId IS NULL OR p.supplier.id = :supplierId) AND " +
            "(:locationId IS NULL OR p.location.id = :locationId) AND " +
            "(:startDate IS NULL OR p.purchaseDate >= :startDate) AND " +
            "(:endDate IS NULL OR p.purchaseDate <= :endDate) AND " +
            "(:search IS NULL OR LOWER(p.purchaseNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.supplier.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Purchase> searchPurchases(
            @Param("businessId") Long businessId,
            @Param("status") PurchaseStatus status,
            @Param("supplierId") Long supplierId,
            @Param("locationId") Long locationId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("search") String search,
            Pageable pageable
    );
}
