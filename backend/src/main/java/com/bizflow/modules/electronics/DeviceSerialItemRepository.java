package com.bizflow.modules.electronics;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceSerialItemRepository extends JpaRepository<DeviceSerialItem, Long> {
    List<DeviceSerialItem> findByBusinessIdOrderByCreatedAtDesc(Long businessId);
    Optional<DeviceSerialItem> findByIdAndBusinessId(Long id, Long businessId);

    @Query("SELECT d FROM DeviceSerialItem d WHERE d.business.id = :businessId AND " +
            "(LOWER(d.serialNumber) = LOWER(:code) OR LOWER(d.imeiNumber) = LOWER(:code))")
    Optional<DeviceSerialItem> findBySerialOrImei(@Param("businessId") Long businessId, @Param("code") String code);

    @Query("SELECT d FROM DeviceSerialItem d WHERE d.business.id = :businessId AND " +
            "(LOWER(d.serialNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(d.imeiNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(d.productName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(d.customerName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(d.customerPhone) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<DeviceSerialItem> searchDevices(@Param("businessId") Long businessId, @Param("query") String query);
}
