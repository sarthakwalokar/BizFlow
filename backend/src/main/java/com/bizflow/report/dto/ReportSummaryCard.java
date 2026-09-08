package com.bizflow.report.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportSummaryCard {
    private String title;
    private String value;
    private String subtitle;
}
