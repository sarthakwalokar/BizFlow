package com.bizflow.report.service;

import com.bizflow.report.dto.ReportColumn;
import com.bizflow.report.dto.ReportDataResponse;
import com.bizflow.report.dto.ReportSummaryCard;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Slf4j
@Service
public class PdfExportService {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm");

    // Colors
    private static final Color PRIMARY_COLOR = new Color(79, 70, 229);    // Indigo-600
    private static final Color DARK_BG = new Color(15, 23, 42);           // Slate-900
    private static final Color HEADER_BG = new Color(241, 245, 249);      // Slate-100
    private static final Color BORDER_COLOR = new Color(226, 232, 240);   // Slate-200
    private static final Color ZEBRA_ROW = new Color(248, 250, 252);      // Slate-50
    private static final Color TEXT_DARK = new Color(30, 41, 59);         // Slate-800
    private static final Color TEXT_MUTED = new Color(100, 116, 139);     // Slate-500

    public byte[] generatePdfReport(ReportDataResponse report) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate(), 24, 24, 24, 24);
            PdfWriter writer = PdfWriter.getInstance(document, out);

            document.open();

            // 1. Top Header Banner
            Image logoImg = parseLogoImage(report.getBusinessLogo());
            PdfPTable headerTable;
            if (logoImg != null) {
                headerTable = new PdfPTable(3);
                headerTable.setWidthPercentage(100);
                headerTable.setWidths(new float[]{12, 58, 30});
            } else {
                headerTable = new PdfPTable(2);
                headerTable.setWidthPercentage(100);
                headerTable.setWidths(new float[]{65, 35});
            }
            headerTable.setSpacingAfter(15);

            // Logo Cell (if present)
            if (logoImg != null) {
                PdfPCell logoCell = new PdfPCell(logoImg, true);
                logoCell.setBorder(Rectangle.NO_BORDER);
                logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                headerTable.addCell(logoCell);
            }

            // Left: Business & Report Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, DARK_BG);
            Font bizFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, PRIMARY_COLOR);
            Font metaFont = FontFactory.getFont(FontFactory.HELVETICA, 8, TEXT_MUTED);

            PdfPCell leftCell = new PdfPCell();
            leftCell.setBorder(Rectangle.NO_BORDER);
            leftCell.addElement(new Paragraph("BizFlow Business Management", metaFont));
            leftCell.addElement(new Paragraph(report.getTitle(), titleFont));
            leftCell.addElement(new Paragraph("Business: " + report.getBusinessName(), bizFont));
            headerTable.addCell(leftCell);

            // Right: Date Range & Generated timestamp
            PdfPCell rightCell = new PdfPCell();
            rightCell.setBorder(Rectangle.NO_BORDER);
            rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph rightPara = new Paragraph();
            rightPara.setAlignment(Element.ALIGN_RIGHT);
            rightPara.add(new Chunk("Report Period: " + report.getStartDate() + " to " + report.getEndDate() + "\n", metaFont));
            rightPara.add(new Chunk("Generated: " + report.getGeneratedAt().format(DATE_TIME_FORMATTER) + "\n", metaFont));
            rightPara.add(new Chunk("Currency: " + report.getCurrency() + "\n", metaFont));
            rightCell.addElement(rightPara);
            headerTable.addCell(rightCell);

            document.add(headerTable);

            // 2. Summary KPI Cards
            if (report.getSummaryCards() != null && !report.getSummaryCards().isEmpty()) {
                int numCards = Math.min(report.getSummaryCards().size(), 4);
                PdfPTable kpiTable = new PdfPTable(numCards);
                kpiTable.setWidthPercentage(100);
                kpiTable.setSpacingAfter(15);

                Font cardTitleFont = FontFactory.getFont(FontFactory.HELVETICA, 7.5f, TEXT_MUTED);
                Font cardValueFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, DARK_BG);
                Font cardSubFont = FontFactory.getFont(FontFactory.HELVETICA, 7, TEXT_MUTED);

                for (ReportSummaryCard card : report.getSummaryCards()) {
                    PdfPCell cardCell = new PdfPCell();
                    cardCell.setBackgroundColor(HEADER_BG);
                    cardCell.setBorderColor(BORDER_COLOR);
                    cardCell.setBorderWidth(1);
                    cardCell.setPadding(6);

                    Paragraph pTitle = new Paragraph(card.getTitle().toUpperCase(), cardTitleFont);
                    Paragraph pVal = new Paragraph(card.getValue(), cardValueFont);
                    Paragraph pSub = new Paragraph(card.getSubtitle() != null ? card.getSubtitle() : "", cardSubFont);

                    cardCell.addElement(pTitle);
                    cardCell.addElement(pVal);
                    cardCell.addElement(pSub);
                    kpiTable.addCell(cardCell);
                }
                document.add(kpiTable);
            }

            // 3. Data Table
            if (report.getColumns() != null && !report.getColumns().isEmpty()) {
                int colCount = report.getColumns().size();
                PdfPTable dataTable = new PdfPTable(colCount);
                dataTable.setWidthPercentage(100);
                dataTable.setHeaderRows(1);

                Font thFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, TEXT_DARK);
                Font tdFont = FontFactory.getFont(FontFactory.HELVETICA, 7.5f, TEXT_DARK);

                // Column Headers
                for (ReportColumn col : report.getColumns()) {
                    PdfPCell thCell = new PdfPCell(new Phrase(col.getLabel(), thFont));
                    thCell.setBackgroundColor(HEADER_BG);
                    thCell.setBorderColor(BORDER_COLOR);
                    thCell.setPadding(6);
                    if ("RIGHT".equalsIgnoreCase(col.getAlign())) {
                        thCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                    } else if ("CENTER".equalsIgnoreCase(col.getAlign())) {
                        thCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    } else {
                        thCell.setHorizontalAlignment(Element.ALIGN_LEFT);
                    }
                    dataTable.addCell(thCell);
                }

                // Data Rows
                int rowIndex = 0;
                for (Map<String, Object> row : report.getRows()) {
                    Color rowBg = (rowIndex % 2 == 1) ? ZEBRA_ROW : Color.WHITE;
                    for (ReportColumn col : report.getColumns()) {
                        Object val = row.get(col.getKey());
                        String text = val != null ? String.valueOf(val) : "-";
                        PdfPCell tdCell = new PdfPCell(new Phrase(text, tdFont));
                        tdCell.setBackgroundColor(rowBg);
                        tdCell.setBorderColor(BORDER_COLOR);
                        tdCell.setPadding(5);
                        if ("RIGHT".equalsIgnoreCase(col.getAlign())) {
                            tdCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                        } else if ("CENTER".equalsIgnoreCase(col.getAlign())) {
                            tdCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                        } else {
                            tdCell.setHorizontalAlignment(Element.ALIGN_LEFT);
                        }
                        dataTable.addCell(tdCell);
                    }
                    rowIndex++;
                }

                document.add(dataTable);
            }

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Error generating PDF report", e);
            throw new RuntimeException("Failed to generate PDF export: " + e.getMessage(), e);
        }
    }

    private Image parseLogoImage(String logoStr) {
        if (logoStr == null || logoStr.isBlank()) {
            return null;
        }
        try {
            if (logoStr.startsWith("data:image")) {
                int commaIndex = logoStr.indexOf(',');
                if (commaIndex != -1) {
                    String base64Data = logoStr.substring(commaIndex + 1);
                    byte[] imageBytes = java.util.Base64.getDecoder().decode(base64Data);
                    Image img = Image.getInstance(imageBytes);
                    img.scaleToFit(55, 55);
                    return img;
                }
            } else if (logoStr.startsWith("http://") || logoStr.startsWith("https://")) {
                Image img = Image.getInstance(new java.net.URI(logoStr).toURL());
                img.scaleToFit(55, 55);
                return img;
            }
        } catch (Exception e) {
            log.warn("Could not load logo image for PDF export: {}", e.getMessage());
        }
        return null;
    }
}
