package com.bizflow.inventory.repository;

import com.bizflow.inventory.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {

    @Query("SELECT l FROM Location l WHERE l.business.id = :businessId ORDER BY l.id ASC")
    List<Location> findByBusinessIdOrderByIdAsc(@Param("businessId") Long businessId);

    @Query("SELECT l FROM Location l WHERE l.business.id = :businessId AND l.active = true ORDER BY l.id ASC")
    List<Location> findByBusinessIdAndActiveTrueOrderByIdAsc(@Param("businessId") Long businessId);

    @Query("SELECT l FROM Location l WHERE l.id = :id AND l.business.id = :businessId")
    Optional<Location> findByIdAndBusinessId(@Param("id") Long id, @Param("businessId") Long businessId);

    @Query("SELECT l FROM Location l WHERE l.business.id = :businessId AND l.primary = true")
    Optional<Location> findFirstByBusinessIdAndPrimaryTrue(@Param("businessId") Long businessId);

    @Query("SELECT COUNT(l) > 0 FROM Location l WHERE l.business.id = :businessId AND LOWER(l.name) = LOWER(:name)")
    boolean existsByBusinessIdAndNameIgnoreCase(@Param("businessId") Long businessId, @Param("name") String name);

    @Query("SELECT COUNT(l) > 0 FROM Location l WHERE l.business.id = :businessId AND LOWER(l.name) = LOWER(:name) AND l.id != :id")
    boolean existsByBusinessIdAndNameIgnoreCaseAndIdNot(@Param("businessId") Long businessId, @Param("name") String name, @Param("id") Long id);

    @Modifying
    @Query("UPDATE Location l SET l.primary = false WHERE l.business.id = :businessId AND l.id <> :locationId")
    void clearOtherPrimaryLocations(@Param("businessId") Long businessId, @Param("locationId") Long locationId);

    @Query("SELECT COUNT(l) FROM Location l WHERE l.business.id = :businessId AND l.active = true")
    long countByBusinessIdAndActiveTrue(@Param("businessId") Long businessId);

    @Query("SELECT COUNT(l) FROM Location l WHERE l.business.id = :businessId")
    long countByBusinessId(@Param("businessId") Long businessId);
}
