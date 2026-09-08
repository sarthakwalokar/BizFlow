package com.bizflow.analytics.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopProductPoint {
    private Long productId;
    private String productName;
    private String productType;
    private BigDecimal quantitySold;
    private BigDecimal totalRevenue;
    private double revenuePercentage;
}
