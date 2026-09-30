package com.bizflow.modules.salon;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalonServiceItemRepository extends JpaRepository<SalonServiceItem, Long> {
    List<SalonServiceItem> findByBusinessIdAndIsActiveTrueOrderByNameAsc(Long businessId);
    List<SalonServiceItem> findByBusinessIdOrderByNameAsc(Long businessId);
    Optional<SalonServiceItem> findByIdAndBusinessId(Long id, Long businessId);
}
