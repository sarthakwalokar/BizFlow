package com.bizflow.report.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportDataResponse {
    private ReportType reportType;
    private String title;
    private String businessName;
    private String currency;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime generatedAt;
    private List<ReportSummaryCard> summaryCards;
    private List<ReportColumn> columns;
    private List<Map<String, Object>> rows;
    private long totalRows;
}
