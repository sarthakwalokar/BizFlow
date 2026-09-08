package com.bizflow.analytics.dto;

import com.bizflow.payment.PaymentMethod;
import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDistributionPoint {
    private PaymentMethod paymentMethod;
    private BigDecimal totalAmount;
    private long transactionCount;
    private double percentage;
}
