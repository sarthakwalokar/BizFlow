package com.bizflow.billing;

import com.bizflow.payment.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    @Query("SELECT o FROM Order o WHERE o.id = :id AND o.business.id = :businessId")
    Optional<Order> findByIdAndBusinessId(@Param("id") Long id, @Param("businessId") Long businessId);

    @Query("SELECT o FROM Order o WHERE o.business.id = :businessId AND o.invoiceNumber = :invoiceNumber")
    Optional<Order> findByBusinessIdAndInvoiceNumber(@Param("businessId") Long businessId, @Param("invoiceNumber") String invoiceNumber);

    @Query("SELECT COUNT(o) > 0 FROM Order o WHERE o.business.id = :businessId AND o.invoiceNumber = :invoiceNumber")
    boolean existsByBusinessIdAndInvoiceNumber(@Param("businessId") Long businessId, @Param("invoiceNumber") String invoiceNumber);

    @Query("SELECT o FROM Order o WHERE o.business.id = :businessId AND " +
           "(LOWER(o.invoiceNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "(o.customer IS NOT NULL AND (LOWER(o.customer.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "(o.customer.phone IS NOT NULL AND o.customer.phone LIKE CONCAT('%', :search, '%')))))")
    Page<Order> searchOrders(@Param("businessId") Long businessId,
                             @Param("search") String search,
                             Pageable pageable);

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o " +
           "WHERE o.business.id = :businessId " +
           "AND o.orderStatus = :orderStatus " +
           "AND o.paymentStatus = :paymentStatus " +
           "AND o.createdAt >= :startDate AND o.createdAt <= :endDate")
    BigDecimal sumSalesForDateRange(@Param("businessId") Long businessId,
                                    @Param("startDate") Instant startDate,
                                    @Param("endDate") Instant endDate,
                                    @Param("paymentStatus") PaymentStatus paymentStatus,
                                    @Param("orderStatus") OrderStatus orderStatus);

    @Query("SELECT COUNT(o) FROM Order o " +
           "WHERE o.business.id = :businessId " +
           "AND o.orderStatus = :orderStatus " +
           "AND o.createdAt >= :startDate AND o.createdAt <= :endDate")
    long countOrdersForDateRange(@Param("businessId") Long businessId,
                                 @Param("startDate") Instant startDate,
                                 @Param("endDate") Instant endDate,
                                 @Param("orderStatus") OrderStatus orderStatus);

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o " +
           "WHERE o.business.id = :businessId " +
           "AND o.orderStatus = 'COMPLETED' " +
           "AND o.paymentStatus IN ('PENDING', 'PARTIALLY_PAID')")
    BigDecimal sumPendingDueAmount(@Param("businessId") Long businessId);

    @Query("SELECT o FROM Order o WHERE o.business.id = :businessId ORDER BY o.createdAt DESC")
    List<Order> findRecentOrders(@Param("businessId") Long businessId, Pageable pageable);

    // Customer Specific Queries
    @Query("SELECT o FROM Order o WHERE o.business.id = :businessId AND o.customer.id = :customerId ORDER BY o.createdAt DESC")
    List<Order> findByBusinessIdAndCustomerIdOrderByCreatedAtDesc(@Param("businessId") Long businessId,
                                                                  @Param("customerId") Long customerId);

    @Query("SELECT o FROM Order o WHERE o.business.id = :businessId AND o.customer.id = :customerId")
    Page<Order> findByBusinessIdAndCustomerId(@Param("businessId") Long businessId,
                                              @Param("customerId") Long customerId,
                                              Pageable pageable);

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o " +
           "WHERE o.business.id = :businessId AND o.customer.id = :customerId " +
           "AND o.orderStatus = 'COMPLETED' AND o.paymentStatus = 'COMPLETED'")
    BigDecimal sumCustomerSpending(@Param("businessId") Long businessId, @Param("customerId") Long customerId);

    @Query("SELECT COUNT(o) FROM Order o " +
           "WHERE o.business.id = :businessId AND o.customer.id = :customerId " +
           "AND o.orderStatus = 'COMPLETED'")
    long countCustomerOrders(@Param("businessId") Long businessId, @Param("customerId") Long customerId);

    @Query("SELECT MIN(o.createdAt) FROM Order o " +
           "WHERE o.business.id = :businessId AND o.customer.id = :customerId " +
           "AND o.orderStatus = 'COMPLETED'")
    Instant findCustomerFirstPurchaseDate(@Param("businessId") Long businessId, @Param("customerId") Long customerId);

    @Query("SELECT MAX(o.createdAt) FROM Order o " +
           "WHERE o.business.id = :businessId AND o.customer.id = :customerId " +
           "AND o.orderStatus = 'COMPLETED'")
    Instant findCustomerLastPurchaseDate(@Param("businessId") Long businessId, @Param("customerId") Long customerId);

    // Aggregates for all customers in a business to avoid N+1 queries
    @Query("SELECT o.customer.id, COALESCE(SUM(o.total), 0), COUNT(o.id), MAX(o.createdAt) " +
           "FROM Order o " +
           "WHERE o.business.id = :businessId AND o.customer IS NOT NULL " +
           "AND o.orderStatus = 'COMPLETED' AND o.paymentStatus = 'COMPLETED' " +
           "GROUP BY o.customer.id")
    List<Object[]> findCustomerSpendingSummaryByBusinessId(@Param("businessId") Long businessId);

    // Period & Location-Aware Analytics Queries
    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o " +
           "WHERE o.business.id = :businessId " +
           "AND (:locationId IS NULL OR o.location.id = :locationId) " +
           "AND o.orderStatus = 'COMPLETED' " +
           "AND o.createdAt >= :startDate AND o.createdAt <= :endDate")
    BigDecimal sumSalesForPeriodAndLocation(@Param("businessId") Long businessId,
                                            @Param("locationId") Long locationId,
                                            @Param("startDate") Instant startDate,
                                            @Param("endDate") Instant endDate);

    @Query("SELECT COUNT(o) FROM Order o " +
           "WHERE o.business.id = :businessId " +
           "AND (:locationId IS NULL OR o.location.id = :locationId) " +
           "AND o.orderStatus = 'COMPLETED' " +
           "AND o.createdAt >= :startDate AND o.createdAt <= :endDate")
    long countOrdersForPeriodAndLocation(@Param("businessId") Long businessId,
                                         @Param("locationId") Long locationId,
                                         @Param("startDate") Instant startDate,
                                         @Param("endDate") Instant endDate);

    @Query("SELECT o.paymentMethod, COALESCE(SUM(o.total), 0), COUNT(o) FROM Order o " +
           "WHERE o.business.id = :businessId " +
           "AND (:locationId IS NULL OR o.location.id = :locationId) " +
           "AND o.orderStatus = 'COMPLETED' " +
           "AND o.createdAt >= :startDate AND o.createdAt <= :endDate " +
           "GROUP BY o.paymentMethod")
    List<Object[]> findPaymentDistribution(@Param("businessId") Long businessId,
                                           @Param("locationId") Long locationId,
                                           @Param("startDate") Instant startDate,
                                           @Param("endDate") Instant endDate);

    @Query("SELECT o.location.id, o.location.name, o.location.code, COALESCE(SUM(o.total), 0), COUNT(o) FROM Order o " +
           "WHERE o.business.id = :businessId " +
           "AND o.location IS NOT NULL " +
           "AND o.orderStatus = 'COMPLETED' " +
           "AND o.createdAt >= :startDate AND o.createdAt <= :endDate " +
           "GROUP BY o.location.id, o.location.name, o.location.code")
    List<Object[]> findBranchPerformance(@Param("businessId") Long businessId,
                                         @Param("startDate") Instant startDate,
                                         @Param("endDate") Instant endDate);

    @Query("SELECT o FROM Order o " +
           "WHERE o.business.id = :businessId " +
           "AND (:locationId IS NULL OR o.location.id = :locationId) " +
           "AND o.orderStatus = 'COMPLETED' " +
           "AND o.createdAt >= :startDate AND o.createdAt <= :endDate " +
           "ORDER BY o.createdAt ASC")
    List<Order> findCompletedOrdersForPeriod(@Param("businessId") Long businessId,
                                             @Param("locationId") Long locationId,
                                             @Param("startDate") Instant startDate,
                                             @Param("endDate") Instant endDate);
}
