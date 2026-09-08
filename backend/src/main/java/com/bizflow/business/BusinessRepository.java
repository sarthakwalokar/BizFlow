package com.bizflow.business;

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
public interface BusinessRepository extends JpaRepository<Business, Long>, JpaSpecificationExecutor<Business> {

    Optional<Business> findByName(String name);

    Optional<Business> findByReviewSlug(String reviewSlug);

    boolean existsByReviewSlugAndIdNot(String reviewSlug, Long id);

    List<Business> findByBusinessType(BusinessType businessType);

    List<Business> findByActiveTrue();

    @Query("SELECT b FROM Business b WHERE " +
           "(:businessType IS NULL OR b.businessType = :businessType) AND " +
           "(:active IS NULL OR b.active = :active) AND " +
           "(:search IS NULL OR LOWER(b.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(b.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "(b.phone IS NOT NULL AND b.phone LIKE CONCAT('%', :search, '%')))")
    Page<Business> searchBusinesses(
            @Param("search") String search,
            @Param("businessType") BusinessType businessType,
            @Param("active") Boolean active,
            Pageable pageable
    );
}
