package com.bizflow.report.dto;

import com.bizflow.payment.PaymentMethod;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportFilterRequest {
    private ReportType reportType;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long locationId;
    private Long categoryId;
    private PaymentMethod paymentMethod;
    private String search;
}
