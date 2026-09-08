package com.bizflow.inventory.repository;

import com.bizflow.inventory.MovementType;
import com.bizflow.inventory.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long>, JpaSpecificationExecutor<StockMovement> {

    @Query("SELECT sm FROM StockMovement sm WHERE sm.business.id = :businessId AND " +
            "(:productId IS NULL OR sm.product.id = :productId) AND " +
            "(:locationId IS NULL OR sm.location.id = :locationId) AND " +
            "(:movementType IS NULL OR sm.movementType = :movementType) AND " +
            "(:startInstant IS NULL OR sm.createdAt >= :startInstant) AND " +
            "(:endInstant IS NULL OR sm.createdAt <= :endInstant) " +
            "ORDER BY sm.createdAt DESC")
    Page<StockMovement> searchMovements(
            @Param("businessId") Long businessId,
            @Param("productId") Long productId,
            @Param("locationId") Long locationId,
            @Param("movementType") MovementType movementType,
            @Param("startInstant") Instant startInstant,
            @Param("endInstant") Instant endInstant,
            Pageable pageable
    );

    @Query("SELECT sm FROM StockMovement sm WHERE sm.business.id = :businessId ORDER BY sm.createdAt DESC")
    List<StockMovement> findTop10ByBusinessIdOrderByCreatedAtDesc(@Param("businessId") Long businessId);
}
