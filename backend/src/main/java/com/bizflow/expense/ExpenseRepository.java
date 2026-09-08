package com.bizflow.expense;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long>, JpaSpecificationExecutor<Expense> {

    @Query("SELECT e FROM Expense e WHERE e.id = :id AND e.business.id = :businessId")
    Optional<Expense> findByIdAndBusinessId(@Param("id") Long id, @Param("businessId") Long businessId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e " +
           "WHERE e.business.id = :businessId AND e.expenseDate = :date")
    BigDecimal sumExpensesForDate(@Param("businessId") Long businessId, @Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e " +
           "WHERE e.business.id = :businessId AND e.expenseDate >= :startDate AND e.expenseDate <= :endDate")
    BigDecimal sumExpensesForDateRange(@Param("businessId") Long businessId,
                                       @Param("startDate") LocalDate startDate,
                                       @Param("endDate") LocalDate endDate);

    @Query("SELECT e.category, COALESCE(SUM(e.amount), 0), COUNT(e.id) FROM Expense e " +
           "WHERE e.business.id = :businessId AND e.expenseDate >= :startDate AND e.expenseDate <= :endDate " +
           "GROUP BY e.category")
    List<Object[]> getCategoryBreakdown(@Param("businessId") Long businessId,
                                        @Param("startDate") LocalDate startDate,
                                        @Param("endDate") LocalDate endDate);

    @Query("SELECT e FROM Expense e WHERE e.business.id = :businessId ORDER BY e.expenseDate DESC, e.createdAt DESC")
    List<Expense> findRecentExpenses(@Param("businessId") Long businessId, Pageable pageable);

    @Query("SELECT COUNT(e) FROM Expense e WHERE e.business.id = :businessId")
    long countByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e " +
           "WHERE e.business.id = :businessId " +
           "AND (:locationId IS NULL OR e.location.id = :locationId) " +
           "AND e.expenseDate >= :startDate AND e.expenseDate <= :endDate")
    BigDecimal sumExpensesForPeriodAndLocation(@Param("businessId") Long businessId,
                                               @Param("locationId") Long locationId,
                                               @Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate);

    @Query("SELECT e.location.id, COALESCE(SUM(e.amount), 0) FROM Expense e " +
           "WHERE e.business.id = :businessId AND e.location IS NOT NULL " +
           "AND e.expenseDate >= :startDate AND e.expenseDate <= :endDate " +
           "GROUP BY e.location.id")
    List<Object[]> sumExpensesByBranch(@Param("businessId") Long businessId,
                                       @Param("startDate") LocalDate startDate,
                                       @Param("endDate") LocalDate endDate);

    @Query("SELECT e FROM Expense e " +
           "WHERE e.business.id = :businessId " +
           "AND (:locationId IS NULL OR e.location.id = :locationId) " +
           "AND e.expenseDate >= :startDate AND e.expenseDate <= :endDate " +
           "ORDER BY e.expenseDate ASC")
    List<Expense> findExpensesForPeriod(@Param("businessId") Long businessId,
                                        @Param("locationId") Long locationId,
                                        @Param("startDate") LocalDate startDate,
                                        @Param("endDate") LocalDate endDate);
}
