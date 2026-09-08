package com.bizflow.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    @Query("SELECT c FROM Category c WHERE c.business.id = :businessId")
    List<Category> findByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT c FROM Category c WHERE c.business.id = :businessId AND c.active = true")
    List<Category> findByBusinessIdAndActiveTrue(@Param("businessId") Long businessId);

    @Query("SELECT c FROM Category c WHERE c.id = :id AND c.business.id = :businessId")
    Optional<Category> findByIdAndBusinessId(@Param("id") Long id, @Param("businessId") Long businessId);

    @Query("SELECT COUNT(c) > 0 FROM Category c WHERE c.business.id = :businessId AND LOWER(c.name) = LOWER(:name)")
    boolean existsByBusinessIdAndNameIgnoreCase(@Param("businessId") Long businessId, @Param("name") String name);

    @Query("SELECT COUNT(c) > 0 FROM Category c WHERE c.business.id = :businessId AND LOWER(c.name) = LOWER(:name) AND c.id != :id")
    boolean existsByBusinessIdAndNameIgnoreCaseAndIdNot(@Param("businessId") Long businessId, @Param("name") String name, @Param("id") Long id);
}
