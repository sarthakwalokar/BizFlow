package com.bizflow.review;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long>, JpaSpecificationExecutor<Review> {

    @Query("SELECT r FROM Review r WHERE r.id = :id AND r.business.id = :businessId")
    Optional<Review> findByIdAndBusinessId(@Param("id") Long id, @Param("businessId") Long businessId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.business.id = :businessId AND r.hidden = false")
    long countByBusinessIdAndHiddenFalse(@Param("businessId") Long businessId);

    @Query("SELECT COALESCE(AVG(CAST(r.rating AS double)), 0.0) FROM Review r " +
           "WHERE r.business.id = :businessId AND r.hidden = false")
    Double getAverageRating(@Param("businessId") Long businessId);

    @Query("SELECT r.rating, COUNT(r.id) FROM Review r " +
           "WHERE r.business.id = :businessId AND r.hidden = false " +
           "GROUP BY r.rating ORDER BY r.rating DESC")
    List<Object[]> getRatingDistribution(@Param("businessId") Long businessId);

    @Query("SELECT COUNT(r) FROM Review r " +
           "WHERE r.business.id = :businessId AND r.positive = true AND r.hidden = false")
    long countPositiveReviews(@Param("businessId") Long businessId);

    @Query("SELECT COUNT(r) FROM Review r " +
           "WHERE r.business.id = :businessId AND r.redirectedToPublicPlatform = true")
    long countPublicPlatformRedirects(@Param("businessId") Long businessId);

    @Query("SELECT r FROM Review r " +
           "WHERE r.business.id = :businessId " +
           "ORDER BY r.createdAt DESC")
    List<Review> findRecentReviews(@Param("businessId") Long businessId, Pageable pageable);

    @Query("SELECT r FROM Review r " +
           "WHERE r.business.id = :businessId " +
           "AND r.createdAt >= :startDate AND r.createdAt <= :endDate " +
           "ORDER BY r.createdAt DESC")
    List<Review> findReviewsForPeriod(@Param("businessId") Long businessId,
                                      @Param("startDate") java.time.Instant startDate,
                                      @Param("endDate") java.time.Instant endDate);
}
