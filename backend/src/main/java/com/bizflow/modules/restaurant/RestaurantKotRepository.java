package com.bizflow.modules.restaurant;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantKotRepository extends JpaRepository<RestaurantKotTicket, Long> {
    List<RestaurantKotTicket> findByBusinessIdOrderByCreatedAtDesc(Long businessId);
    List<RestaurantKotTicket> findByBusinessIdAndStatusNotOrderByCreatedAtAsc(Long businessId, String status);
    Optional<RestaurantKotTicket> findByIdAndBusinessId(Long id, Long businessId);
    List<RestaurantKotTicket> findByOrderId(Long orderId);
    void deleteByOrderId(Long orderId);
}
