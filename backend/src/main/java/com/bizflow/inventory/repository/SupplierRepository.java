package com.bizflow.inventory.repository;

import com.bizflow.inventory.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long>, JpaSpecificationExecutor<Supplier> {

    @Query("SELECT s FROM Supplier s WHERE s.business.id = :businessId AND s.active = true ORDER BY s.name ASC")
    List<Supplier> findByBusinessIdAndActiveTrueOrderByNameAsc(@Param("businessId") Long businessId);

    @Query("SELECT s FROM Supplier s WHERE s.id = :id AND s.business.id = :businessId")
    Optional<Supplier> findByIdAndBusinessId(@Param("id") Long id, @Param("businessId") Long businessId);

    @Query("SELECT COUNT(s) > 0 FROM Supplier s WHERE s.business.id = :businessId AND LOWER(s.name) = LOWER(:name)")
    boolean existsByBusinessIdAndNameIgnoreCase(@Param("businessId") Long businessId, @Param("name") String name);

    @Query("SELECT COUNT(s) > 0 FROM Supplier s WHERE s.business.id = :businessId AND LOWER(s.name) = LOWER(:name) AND s.id != :id")
    boolean existsByBusinessIdAndNameIgnoreCaseAndIdNot(@Param("businessId") Long businessId, @Param("name") String name, @Param("id") Long id);

    @Query("SELECT s FROM Supplier s WHERE s.business.id = :businessId AND " +
            "(:active IS NULL OR s.active = :active) AND " +
            "(:search IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(s.contactPerson) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "s.phone LIKE CONCAT('%', :search, '%'))")
    Page<Supplier> searchSuppliers(
            @Param("businessId") Long businessId,
            @Param("active") Boolean active,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT COUNT(s) FROM Supplier s WHERE s.business.id = :businessId AND s.active = true")
    long countByBusinessIdAndActiveTrue(@Param("businessId") Long businessId);
}
