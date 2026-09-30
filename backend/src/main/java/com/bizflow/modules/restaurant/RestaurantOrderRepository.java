package com.bizflow.modules.restaurant;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantOrderRepository extends JpaRepository<RestaurantOrder, Long> {
    List<RestaurantOrder> findByBusinessIdOrderByCreatedAtDesc(Long businessId);
    List<RestaurantOrder> findByBusinessIdAndStatusInOrderByCreatedAtDesc(Long businessId, List<String> statuses);
    Optional<RestaurantOrder> findByIdAndBusinessId(Long id, Long businessId);
    Optional<RestaurantOrder> findFirstByBusinessIdAndTableIdAndStatusNot(Long businessId, Long tableId, String status);
}
