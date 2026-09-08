package com.bizflow.customer;

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
public interface CustomerRepository extends JpaRepository<Customer, Long>, JpaSpecificationExecutor<Customer> {

    @Query("SELECT c FROM Customer c WHERE c.business.id = :businessId ORDER BY c.name ASC")
    List<Customer> findByBusinessIdOrderByNameAsc(@Param("businessId") Long businessId);

    @Query("SELECT c FROM Customer c WHERE c.id = :id AND c.business.id = :businessId")
    Optional<Customer> findByIdAndBusinessId(@Param("id") Long id, @Param("businessId") Long businessId);

    @Query("SELECT c FROM Customer c WHERE c.business.id = :businessId AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "(c.phone IS NOT NULL AND c.phone LIKE CONCAT('%', :search, '%')) OR " +
           "(c.email IS NOT NULL AND LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%'))))")
    Page<Customer> searchCustomers(@Param("businessId") Long businessId,
                                  @Param("search") String search,
                                  Pageable pageable);

    @Query("SELECT c FROM Customer c WHERE c.business.id = :businessId AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "(c.phone IS NOT NULL AND c.phone LIKE CONCAT('%', :search, '%')))")
    List<Customer> quickSearch(@Param("businessId") Long businessId, @Param("search") String search);

    @Query("SELECT COUNT(c) > 0 FROM Customer c WHERE c.business.id = :businessId AND c.phone = :phone")
    boolean existsByBusinessIdAndPhone(@Param("businessId") Long businessId, @Param("phone") String phone);

    @Query("SELECT COUNT(c) FROM Customer c WHERE c.business.id = :businessId")
    long countByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT COUNT(c) FROM Customer c " +
           "WHERE c.business.id = :businessId " +
           "AND c.createdAt >= :startDate AND c.createdAt <= :endDate")
    long countNewCustomersForPeriod(@Param("businessId") Long businessId,
                                    @Param("startDate") java.time.Instant startDate,
                                    @Param("endDate") java.time.Instant endDate);
}
