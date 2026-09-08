package com.bizflow.customer.service;

import com.bizflow.billing.Order;
import com.bizflow.billing.OrderRepository;
import com.bizflow.billing.dto.OrderResponse;
import com.bizflow.business.Business;
import com.bizflow.business.BusinessRepository;
import com.bizflow.common.api.PageResponse;
import com.bizflow.common.exception.ResourceNotFoundException;
import com.bizflow.customer.Customer;
import com.bizflow.customer.CustomerRepository;
import com.bizflow.customer.dto.CustomerProfileResponse;
import com.bizflow.customer.dto.CustomerRequest;
import com.bizflow.customer.dto.CustomerResponse;
import com.bizflow.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

import com.bizflow.payment.PaymentRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final BusinessRepository businessRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public PageResponse<CustomerResponse> getCustomers(String search, int page, int size, String sort) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Customer> customerPage;
        if (search != null && !search.trim().isEmpty()) {
            customerPage = customerRepository.searchCustomers(businessId, search.trim(), pageable);
        } else {
            customerPage = customerRepository.findAll(
                    (root, query, cb) -> cb.equal(root.get("business").get("id"), businessId),
                    pageable
            );
        }

        // Fetch customer metrics summary in bulk for current business
        List<Object[]> statsList = orderRepository.findCustomerSpendingSummaryByBusinessId(businessId);
        Map<Long, Object[]> statsMap = new HashMap<>();
        for (Object[] row : statsList) {
            if (row[0] != null) {
                statsMap.put((Long) row[0], row);
            }
        }

        List<CustomerResponse> content = customerPage.getContent().stream()
                .map(c -> {
                    Object[] stats = statsMap.get(c.getId());
                    BigDecimal totalSpending = stats != null && stats[1] != null ? (BigDecimal) stats[1] : BigDecimal.ZERO;
                    Long orderCount = stats != null && stats[2] != null ? (Long) stats[2] : 0L;
                    Instant lastPurchase = stats != null && stats[3] != null ? (Instant) stats[3] : null;
                    return CustomerResponse.fromEntityWithStats(c, totalSpending, orderCount, lastPurchase);
                })
                .collect(Collectors.toList());

        return PageResponse.<CustomerResponse>builder()
                .content(content)
                .pageNumber(customerPage.getNumber())
                .pageSize(customerPage.getSize())
                .totalElements(customerPage.getTotalElements())
                .totalPages(customerPage.getTotalPages())
                .isFirst(customerPage.isFirst())
                .isLast(customerPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> quickSearchCustomers(String query) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        if (query == null || query.trim().isEmpty()) {
            return customerRepository.findByBusinessIdOrderByNameAsc(businessId).stream()
                    .limit(20)
                    .map(CustomerResponse::fromEntity)
                    .collect(Collectors.toList());
        }

        return customerRepository.quickSearch(businessId, query.trim()).stream()
                .limit(20)
                .map(CustomerResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long id) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Customer customer = customerRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        
        BigDecimal totalSpending = orderRepository.sumCustomerSpending(businessId, id);
        long orderCount = orderRepository.countCustomerOrders(businessId, id);
        Instant lastPurchase = orderRepository.findCustomerLastPurchaseDate(businessId, id);

        return CustomerResponse.fromEntityWithStats(customer, totalSpending, orderCount, lastPurchase);
    }

    @Transactional(readOnly = true)
    public CustomerProfileResponse getCustomerProfile(Long id) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Customer customer = customerRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));

        BigDecimal totalSpending = orderRepository.sumCustomerSpending(businessId, id);
        long orderCount = orderRepository.countCustomerOrders(businessId, id);
        Instant firstPurchase = orderRepository.findCustomerFirstPurchaseDate(businessId, id);
        Instant lastPurchase = orderRepository.findCustomerLastPurchaseDate(businessId, id);

        List<Order> orders = orderRepository.findByBusinessIdAndCustomerIdOrderByCreatedAtDesc(businessId, id);
        List<OrderResponse> purchaseHistory = orders.stream()
                .map(o -> OrderResponse.fromEntity(o, paymentRepository.findByOrderId(o.getId())))
                .collect(Collectors.toList());

        return CustomerProfileResponse.fromEntity(
                customer,
                totalSpending,
                orderCount,
                firstPurchase,
                lastPurchase,
                purchaseHistory
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getCustomerOrders(Long id, int page, int size) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        // verify customer exists
        customerRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Order> orderPage = orderRepository.findByBusinessIdAndCustomerId(businessId, id, pageable);

        List<OrderResponse> content = orderPage.getContent().stream()
                .map(o -> OrderResponse.fromEntity(o, paymentRepository.findByOrderId(o.getId())))
                .collect(Collectors.toList());

        return PageResponse.<OrderResponse>builder()
                .content(content)
                .pageNumber(orderPage.getNumber())
                .pageSize(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .isFirst(orderPage.isFirst())
                .isLast(orderPage.isLast())
                .build();
    }

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        log.info("Creating customer '{}' for business {}", request.getName(), businessId);

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", "id", businessId));

        Customer customer = Customer.builder()
                .business(business)
                .name(request.getName().trim())
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .email(request.getEmail() != null ? request.getEmail().trim() : null)
                .address(request.getAddress())
                .notes(request.getNotes())
                .build();

        Customer saved = customerRepository.save(customer);
        return CustomerResponse.fromEntity(saved);
    }

    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        log.info("Updating customer {} for business {}", id, businessId);

        Customer customer = customerRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));

        customer.setName(request.getName().trim());
        customer.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        customer.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
        customer.setAddress(request.getAddress());
        customer.setNotes(request.getNotes());

        Customer updated = customerRepository.save(customer);
        return CustomerResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        log.info("Deleting customer {} for business {}", id, businessId);

        Customer customer = customerRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));

        // Unlink customer from existing orders so orders maintain historical invoice consistency
        List<Order> orders = orderRepository.findByBusinessIdAndCustomerIdOrderByCreatedAtDesc(businessId, id);
        for (Order o : orders) {
            o.setCustomer(null);
            orderRepository.save(o);
        }

        customerRepository.delete(customer);
    }
}
