package com.bizflow.inventory.repository;

import com.bizflow.inventory.PurchaseItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseItemRepository extends JpaRepository<PurchaseItem, Long> {

    @Query("SELECT pi FROM PurchaseItem pi WHERE pi.purchase.id = :purchaseId")
    List<PurchaseItem> findByPurchaseId(@Param("purchaseId") Long purchaseId);
}
