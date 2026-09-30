package com.bizflow.modules.restaurant;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {
    List<RestaurantTable> findByBusinessIdOrderByTableNumberAsc(Long businessId);
    Optional<RestaurantTable> findByIdAndBusinessId(Long id, Long businessId);
}
