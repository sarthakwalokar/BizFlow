package com.bizflow.expense.service;

import com.bizflow.business.Business;
import com.bizflow.business.BusinessRepository;
import com.bizflow.common.api.PageResponse;
import com.bizflow.common.exception.ResourceNotFoundException;
import com.bizflow.expense.Expense;
import com.bizflow.expense.ExpenseCategory;
import com.bizflow.expense.ExpenseRepository;
import com.bizflow.expense.dto.ExpenseCategorySummary;
import com.bizflow.expense.dto.ExpenseRequest;
import com.bizflow.expense.dto.ExpenseResponse;
import com.bizflow.expense.dto.ExpenseSummaryResponse;
import com.bizflow.payment.PaymentMethod;
import com.bizflow.security.SecurityUtils;
import com.bizflow.user.User;
import com.bizflow.user.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PageResponse<ExpenseResponse> getExpenses(
            LocalDate startDate,
            LocalDate endDate,
            ExpenseCategory category,
            PaymentMethod paymentMethod,
            BigDecimal minAmount,
            BigDecimal maxAmount,
            String search,
            int page,
            int size,
            String sort) {

        Long businessId = SecurityUtils.getCurrentBusinessId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "expenseDate", "createdAt"));

        Specification<Expense> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("business").get("id"), businessId));

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("expenseDate"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("expenseDate"), endDate));
            }
            if (category != null) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            if (paymentMethod != null) {
                predicates.add(cb.equal(root.get("paymentMethod"), paymentMethod));
            }
            if (minAmount != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("amount"), minAmount));
            }
            if (maxAmount != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("amount"), maxAmount));
            }
            if (search != null && !search.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("description")), "%" + search.trim().toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Expense> expensePage = expenseRepository.findAll(spec, pageable);

        List<ExpenseResponse> content = expensePage.getContent().stream()
                .map(ExpenseResponse::fromEntity)
                .collect(Collectors.toList());

        return PageResponse.<ExpenseResponse>builder()
                .content(content)
                .pageNumber(expensePage.getNumber())
                .pageSize(expensePage.getSize())
                .totalElements(expensePage.getTotalElements())
                .totalPages(expensePage.getTotalPages())
                .isFirst(expensePage.isFirst())
                .isLast(expensePage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public ExpenseResponse getExpenseById(Long id) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Expense expense = expenseRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", id));
        return ExpenseResponse.fromEntity(expense);
    }

    @Transactional
    public ExpenseResponse createExpense(ExpenseRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Long currentUserId = SecurityUtils.getCurrentUserId();
        log.info("Recording new expense {} in category {} for business {}", request.getAmount(), request.getCategory(), businessId);

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", "id", businessId));

        User user = null;
        if (currentUserId != null) {
            user = userRepository.findById(currentUserId).orElse(null);
        }

        Expense expense = Expense.builder()
                .business(business)
                .category(request.getCategory())
                .description(request.getDescription())
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .expenseDate(request.getExpenseDate())
                .createdBy(user)
                .build();

        Expense saved = expenseRepository.save(expense);
        return ExpenseResponse.fromEntity(saved);
    }

    @Transactional
    public ExpenseResponse updateExpense(Long id, ExpenseRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        log.info("Updating expense {} for business {}", id, businessId);

        Expense expense = expenseRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", id));

        expense.setCategory(request.getCategory());
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setPaymentMethod(request.getPaymentMethod());
        expense.setExpenseDate(request.getExpenseDate());

        Expense updated = expenseRepository.save(expense);
        return ExpenseResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteExpense(Long id) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        log.info("Deleting expense {} for business {}", id, businessId);

        Expense expense = expenseRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", id));

        expenseRepository.delete(expense);
    }

    @Transactional(readOnly = true)
    public ExpenseSummaryResponse getExpenseSummary() {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        LocalDate today = LocalDate.now();
        LocalDate firstDayOfMonth = today.withDayOfMonth(1);
        LocalDate lastDayOfMonth = today.withDayOfMonth(today.lengthOfMonth());

        BigDecimal todayExpenses = expenseRepository.sumExpensesForDate(businessId, today);
        BigDecimal monthExpenses = expenseRepository.sumExpensesForDateRange(businessId, firstDayOfMonth, lastDayOfMonth);

        // Category breakdown for current month
        List<Object[]> breakdownRows = expenseRepository.getCategoryBreakdown(businessId, firstDayOfMonth, lastDayOfMonth);
        List<ExpenseCategorySummary> categorySummaries = new ArrayList<>();

        for (Object[] row : breakdownRows) {
            ExpenseCategory cat;
            if (row[0] instanceof ExpenseCategory ec) {
                cat = ec;
            } else if (row[0] instanceof String s) {
                cat = ExpenseCategory.valueOf(s);
            } else {
                cat = ExpenseCategory.OTHER;
            }

            BigDecimal catTotal = row[1] instanceof BigDecimal bd ? bd : (row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO);
            Long count = row[2] instanceof Number n ? n.longValue() : 0L;

            Double percentage = 0.0;
            if (monthExpenses.compareTo(BigDecimal.ZERO) > 0) {
                percentage = catTotal.divide(monthExpenses, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .doubleValue();
            }

            categorySummaries.add(ExpenseCategorySummary.builder()
                    .category(cat)
                    .totalAmount(catTotal)
                    .transactionCount(count)
                    .percentage(percentage)
                    .build());
        }

        // Recent 10 expenses
        List<Expense> recent = expenseRepository.findRecentExpenses(businessId, PageRequest.of(0, 10));
        List<ExpenseResponse> recentResponses = recent.stream()
                .map(ExpenseResponse::fromEntity)
                .collect(Collectors.toList());

        return ExpenseSummaryResponse.builder()
                .todayExpenses(todayExpenses)
                .monthExpenses(monthExpenses)
                .totalExpenses(monthExpenses)
                .categoryBreakdown(categorySummaries)
                .recentExpenses(recentResponses)
                .build();
    }
}
