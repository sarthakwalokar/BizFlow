package com.bizflow.analytics.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerFrequencyMetrics {
    private long totalCustomers;
    private long newCustomersInPeriod;
    private long activeCustomersInPeriod;
    private long repeatCustomers;
    private double repeatCustomerRate;
    private double averageOrdersPerCustomer;
    private BigDecimal averageCustomerLifetimeValue;
}
