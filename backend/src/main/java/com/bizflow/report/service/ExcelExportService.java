package com.bizflow.report.service;

import com.bizflow.report.dto.ReportColumn;
import com.bizflow.report.dto.ReportDataResponse;
import com.bizflow.report.dto.ReportSummaryCard;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Slf4j
@Service
public class ExcelExportService {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public byte[] generateExcelReport(ReportDataResponse report) {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            XSSFSheet sheet = workbook.createSheet(report.getReportType().name() + " Report");
            sheet.setDisplayGridlines(true);

            // 1. Styles
            XSSFCellStyle titleStyle = workbook.createCellStyle();
            XSSFFont titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);
            titleFont.setColor(new XSSFColor(new byte[]{(byte) 15, (byte) 23, (byte) 42}, null));
            titleStyle.setFont(titleFont);

            XSSFCellStyle subtitleStyle = workbook.createCellStyle();
            XSSFFont subFont = workbook.createFont();
            subFont.setFontHeightInPoints((short) 9);
            subFont.setColor(new XSSFColor(new byte[]{(byte) 100, (byte) 116, (byte) 139}, null));
            subtitleStyle.setFont(subFont);

            XSSFCellStyle headerStyle = workbook.createCellStyle();
            XSSFFont headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(new XSSFColor(new byte[]{(byte) 255, (byte) 255, (byte) 255}, null));
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(new XSSFColor(new byte[]{(byte) 79, (byte) 70, (byte) 229}, null)); // Indigo-600
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            XSSFCellStyle kpiCardStyle = workbook.createCellStyle();
            kpiCardStyle.setFillForegroundColor(new XSSFColor(new byte[]{(byte) 241, (byte) 245, (byte) 249}, null));
            kpiCardStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            kpiCardStyle.setBorderBottom(BorderStyle.THIN);
            kpiCardStyle.setBorderTop(BorderStyle.THIN);
            kpiCardStyle.setBorderLeft(BorderStyle.THIN);
            kpiCardStyle.setBorderRight(BorderStyle.THIN);

            XSSFCellStyle dataLeftStyle = workbook.createCellStyle();
            dataLeftStyle.setBorderBottom(BorderStyle.THIN);
            dataLeftStyle.setBorderTop(BorderStyle.THIN);
            dataLeftStyle.setBorderLeft(BorderStyle.THIN);
            dataLeftStyle.setBorderRight(BorderStyle.THIN);
            dataLeftStyle.setAlignment(HorizontalAlignment.LEFT);

            XSSFCellStyle dataRightStyle = workbook.createCellStyle();
            dataRightStyle.setBorderBottom(BorderStyle.THIN);
            dataRightStyle.setBorderTop(BorderStyle.THIN);
            dataRightStyle.setBorderLeft(BorderStyle.THIN);
            dataRightStyle.setBorderRight(BorderStyle.THIN);
            dataRightStyle.setAlignment(HorizontalAlignment.RIGHT);

            XSSFCellStyle dataCenterStyle = workbook.createCellStyle();
            dataCenterStyle.setBorderBottom(BorderStyle.THIN);
            dataCenterStyle.setBorderTop(BorderStyle.THIN);
            dataCenterStyle.setBorderLeft(BorderStyle.THIN);
            dataCenterStyle.setBorderRight(BorderStyle.THIN);
            dataCenterStyle.setAlignment(HorizontalAlignment.CENTER);

            int rowNum = 0;

            // 2. Title Block
            Row titleRow = sheet.createRow(rowNum++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue(report.getTitle() + " - " + report.getBusinessName());
            titleCell.setCellStyle(titleStyle);

            Row metaRow = sheet.createRow(rowNum++);
            Cell metaCell = metaRow.createCell(0);
            metaCell.setCellValue("Period: " + report.getStartDate() + " to " + report.getEndDate() + " | Generated: " + report.getGeneratedAt().format(DATE_TIME_FORMATTER) + " | Currency: " + report.getCurrency());
            metaCell.setCellStyle(subtitleStyle);

            rowNum++; // Blank separator

            // 3. Summary KPI Block
            if (report.getSummaryCards() != null && !report.getSummaryCards().isEmpty()) {
                Row kpiHeaderRow = sheet.createRow(rowNum++);
                Row kpiValRow = sheet.createRow(rowNum++);

                int colIdx = 0;
                for (ReportSummaryCard card : report.getSummaryCards()) {
                    Cell cHeader = kpiHeaderRow.createCell(colIdx);
                    cHeader.setCellValue(card.getTitle());
                    cHeader.setCellStyle(kpiCardStyle);

                    Cell cVal = kpiValRow.createCell(colIdx);
                    cVal.setCellValue(card.getValue());
                    cVal.setCellStyle(kpiCardStyle);

                    colIdx += 2;
                }
                rowNum++; // Blank separator
            }

            // 4. Data Table Header Row
            if (report.getColumns() != null && !report.getColumns().isEmpty()) {
                Row tableHeader = sheet.createRow(rowNum++);
                int colIdx = 0;
                for (ReportColumn col : report.getColumns()) {
                    Cell cell = tableHeader.createCell(colIdx++);
                    cell.setCellValue(col.getLabel());
                    cell.setCellStyle(headerStyle);
                }

                // Data Rows
                for (Map<String, Object> dataRow : report.getRows()) {
                    Row sheetRow = sheet.createRow(rowNum++);
                    colIdx = 0;
                    for (ReportColumn col : report.getColumns()) {
                        Cell cell = sheetRow.createCell(colIdx++);
                        Object val = dataRow.get(col.getKey());

                        if ("RIGHT".equalsIgnoreCase(col.getAlign()) || "CURRENCY".equalsIgnoreCase(col.getType()) || "NUMBER".equalsIgnoreCase(col.getType())) {
                            cell.setCellStyle(dataRightStyle);
                            if (val instanceof Number) {
                                cell.setCellValue(((Number) val).doubleValue());
                            } else if (val != null) {
                                try {
                                    double d = Double.parseDouble(val.toString());
                                    cell.setCellValue(d);
                                } catch (Exception e) {
                                    cell.setCellValue(val.toString());
                                }
                            } else {
                                cell.setCellValue("-");
                            }
                        } else if ("CENTER".equalsIgnoreCase(col.getAlign()) || "BADGE".equalsIgnoreCase(col.getType())) {
                            cell.setCellStyle(dataCenterStyle);
                            cell.setCellValue(val != null ? val.toString() : "-");
                        } else {
                            cell.setCellStyle(dataLeftStyle);
                            cell.setCellValue(val != null ? val.toString() : "-");
                        }
                    }
                }

                // Auto-size columns
                for (int i = 0; i < report.getColumns().size(); i++) {
                    sheet.autoSizeColumn(i);
                    // Ensure minimum width of 12 characters
                    int curWidth = sheet.getColumnWidth(i);
                    if (curWidth < 3000) {
                        sheet.setColumnWidth(i, 3000);
                    }
                }
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Error generating Excel report", e);
            throw new RuntimeException("Failed to generate Excel export: " + e.getMessage(), e);
        }
    }
}
