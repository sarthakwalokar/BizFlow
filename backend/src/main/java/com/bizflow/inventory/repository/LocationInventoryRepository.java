package com.bizflow.inventory.repository;

import com.bizflow.inventory.LocationInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationInventoryRepository extends JpaRepository<LocationInventory, Long> {

    @Query("SELECT li FROM LocationInventory li WHERE li.business.id = :businessId AND li.location.id = :locationId AND li.product.id = :productId")
    Optional<LocationInventory> findByBusinessIdAndLocationIdAndProductId(
            @Param("businessId") Long businessId,
            @Param("locationId") Long locationId,
            @Param("productId") Long productId
    );

    @Query("SELECT li FROM LocationInventory li WHERE li.business.id = :businessId AND li.product.id = :productId")
    List<LocationInventory> findByBusinessIdAndProductId(@Param("businessId") Long businessId, @Param("productId") Long productId);

    @Query("SELECT li FROM LocationInventory li WHERE li.business.id = :businessId AND li.location.id = :locationId")
    List<LocationInventory> findByBusinessIdAndLocationId(@Param("businessId") Long businessId, @Param("locationId") Long locationId);

    @Query("SELECT li FROM LocationInventory li WHERE li.business.id = :businessId AND li.quantity <= li.lowStockThreshold")
    List<LocationInventory> findLowStockItems(@Param("businessId") Long businessId);

    @Query("SELECT COALESCE(SUM(li.quantity), 0) FROM LocationInventory li WHERE li.business.id = :businessId AND li.product.id = :productId")
    Integer sumQuantityByProductId(@Param("businessId") Long businessId, @Param("productId") Long productId);
}
