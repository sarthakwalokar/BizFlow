package com.bizflow.report.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportColumn {
    private String key;
    private String label;
    private String type; // "STRING", "NUMBER", "CURRENCY", "DATE", "BADGE"
    private String align; // "LEFT", "RIGHT", "CENTER"
}
