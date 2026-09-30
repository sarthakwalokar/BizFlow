package com.bizflow.modules.repair;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepairJobCardRepository extends JpaRepository<RepairJobCard, Long> {
    List<RepairJobCard> findByBusinessIdOrderByCreatedAtDesc(Long businessId);
    List<RepairJobCard> findByBusinessIdAndStatusOrderByCreatedAtDesc(Long businessId, String status);
    List<RepairJobCard> findByBusinessIdAndCustomerPhoneOrderByCreatedAtDesc(Long businessId, String customerPhone);
    Optional<RepairJobCard> findByIdAndBusinessId(Long id, Long businessId);

    @Query("SELECT j FROM RepairJobCard j WHERE j.business.id = :businessId AND " +
            "(LOWER(j.jobCardNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(j.customerName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(j.customerPhone) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(j.brand) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(j.model) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(j.serialOrImei) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<RepairJobCard> searchJobCards(@Param("businessId") Long businessId, @Param("query") String query);
}
