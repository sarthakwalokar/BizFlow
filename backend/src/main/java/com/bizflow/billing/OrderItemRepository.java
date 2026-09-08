package com.bizflow.billing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.id = :orderId")
    List<OrderItem> findByOrderId(@Param("orderId") Long orderId);

    @Query("SELECT oi.product.id, oi.productNameSnapshot, oi.productType, " +
           "COALESCE(SUM(oi.quantity), 0), COALESCE(SUM(oi.total), 0) " +
           "FROM OrderItem oi " +
           "JOIN oi.order o " +
           "WHERE o.business.id = :businessId " +
           "AND (:locationId IS NULL OR o.location.id = :locationId) " +
           "AND o.orderStatus = 'COMPLETED' " +
           "AND o.createdAt >= :startDate AND o.createdAt <= :endDate " +
           "GROUP BY oi.product.id, oi.productNameSnapshot, oi.productType " +
           "ORDER BY SUM(oi.total) DESC")
    List<Object[]> findTopSellingProducts(@Param("businessId") Long businessId,
                                          @Param("locationId") Long locationId,
                                          @Param("startDate") Instant startDate,
                                          @Param("endDate") Instant endDate);
}
