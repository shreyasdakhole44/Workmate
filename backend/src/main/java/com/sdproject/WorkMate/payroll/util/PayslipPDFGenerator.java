package com.sdproject.WorkMate.payroll.util;

import com.sdproject.WorkMate.payroll.entity.Payslip;
import com.sdproject.WorkMate.employee.entity.Employee;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.BorderRadius;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.Locale;

@Component
public class PayslipPDFGenerator {

    public byte[] generatePayslip(Payslip payslip, Employee employee) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document doc = new Document(pdfDoc);
            
            // Set margins (0.5 inch / 36 points on all sides)
            doc.setMargins(36F, 36F, 36F, 36F);

            String monthName = Month.of(payslip.getMonth())
                    .getDisplayName(TextStyle.FULL, Locale.ENGLISH);
            String payPeriod = monthName + " " + payslip.getYear();

            // ── COMPANY BRANDING HEADER ───────────────────────────────
            Table headerTable = new Table(UnitValue.createPercentArray(new float[]{65F, 35F}))
                .setWidth(UnitValue.createPercentValue(100F))
                .setMarginBottom(5F);

            // Left side: Logo + Company details
            Table logoAndCompanyTable = new Table(UnitValue.createPercentArray(new float[]{15F, 85F}))
                .setWidth(UnitValue.createPercentValue(100F));

            Cell logoCell = new Cell()
                .add(new Paragraph("TS")
                    .setBold()
                    .setFontSize(14F)
                    .setFontColor(ColorConstants.WHITE)
                    .setTextAlignment(TextAlignment.CENTER))
                .setBackgroundColor(new DeviceRgb(15, 118, 110)) // #0F766E
                .setBorder(null)
                .setBorderRadius(new BorderRadius(6F))
                .setWidth(40F)
                .setHeight(40F)
                .setPaddingTop(8F);

            Cell companyInfoCell = new Cell()
                .add(new Paragraph("Talentrix Solution")
                    .setBold()
                    .setFontSize(14F)
                    .setFontColor(new DeviceRgb(15, 118, 110)))
                .add(new Paragraph("WorkMate HRMS · Powered by Spring Boot")
                    .setFontSize(9F)
                    .setFontColor(new DeviceRgb(100, 116, 139)))
                .setBorder(null)
                .setPaddingLeft(10F)
                .setPaddingTop(2F);

            logoAndCompanyTable.addCell(logoCell);
            logoAndCompanyTable.addCell(companyInfoCell);

            headerTable.addCell(new Cell().add(logoAndCompanyTable).setBorder(null));

            // Right side: Salary Slip title and period
            Cell titlePeriodCell = new Cell()
                .add(new Paragraph("Salary Slip")
                    .setBold()
                    .setFontSize(14F)
                    .setFontColor(new DeviceRgb(15, 118, 110))
                    .setTextAlignment(TextAlignment.RIGHT))
                .add(new Paragraph(payPeriod)
                    .setFontSize(11F)
                    .setBold()
                    .setFontColor(new DeviceRgb(30, 41, 59))
                    .setTextAlignment(TextAlignment.RIGHT))
                .setBorder(null);

            headerTable.addCell(titlePeriodCell);
            doc.add(headerTable);

            // Solid 2px Teal Divider bottom border
            Table borderLine = new Table(1)
                .setWidth(UnitValue.createPercentValue(100F))
                .setHeight(2F)
                .setBackgroundColor(new DeviceRgb(15, 118, 110))
                .setBorder(null)
                .setMarginTop(5F)
                .setMarginBottom(15F);
            doc.add(borderLine);

            // ── EMPLOYEE DETAILS SECTION ──────────────────────────────
            Table detailsTable = new Table(UnitValue.createPercentArray(new float[]{20F, 30F, 20F, 30F}))
                .setWidth(UnitValue.createPercentValue(100F))
                .setMarginBottom(20F)
                .setBorder(new SolidBorder(new DeviceRgb(226, 232, 240), 1F)); // light gray border around table

            detailsTable.addCell(createDetailsCell("Employee Name", true));
            detailsTable.addCell(createDetailsCell(employee.getFullName(), false));
            detailsTable.addCell(createDetailsCell("Employee Code", true));
            detailsTable.addCell(createDetailsCell(employee.getEmpCode() != null ? employee.getEmpCode() : "N/A", false));

            detailsTable.addCell(createDetailsCell("Designation", true));
            detailsTable.addCell(createDetailsCell(employee.getDesignation() != null ? employee.getDesignation() : "N/A", false));
            detailsTable.addCell(createDetailsCell("Department", true));
            detailsTable.addCell(createDetailsCell(employee.getDepartment(), false));

            detailsTable.addCell(createDetailsCell("Bank Account", true));
            detailsTable.addCell(createDetailsCell(maskBankAccount(employee.getBankAccount()), false));
            detailsTable.addCell(createDetailsCell("PAN", true));
            detailsTable.addCell(createDetailsCell(maskPan(employee.getPanNumber()), false));

            detailsTable.addCell(createDetailsCell("UAN", true));
            detailsTable.addCell(createDetailsCell(maskUan(employee.getUanNumber()), false));
            detailsTable.addCell(createDetailsCell("Joining Date", true));
            detailsTable.addCell(createDetailsCell(employee.getJoinDate() != null ? employee.getJoinDate().toString() : "N/A", false));

            doc.add(detailsTable);

            // ── SIDE-BY-SIDE TABLES (EARNINGS & DEDUCTIONS) ───────────
            Table mainTable = new Table(UnitValue.createPercentArray(new float[]{48F, 4F, 48F}))
                .setWidth(UnitValue.createPercentValue(100F));

            // Earnings Table (Left)
            Table earningsTable = new Table(UnitValue.createPercentArray(new float[]{65F, 35F}))
                .setWidth(UnitValue.createPercentValue(100F));
            earningsTable.addHeaderCell(createTableHeaderCell("Earnings", false));
            earningsTable.addHeaderCell(createTableHeaderCell("Amount", true));
            
            addTableRow(earningsTable, "Basic Salary", payslip.getBasicSalary());
            addTableRow(earningsTable, "House Rent Allowance (HRA)", payslip.getHra());
            addTableRow(earningsTable, "Special Allowance", payslip.getSpecialAllowance());
            addTableRow(earningsTable, "Conveyance Allowance", payslip.getConveyanceAllowance());
            addTableRow(earningsTable, "Medical Allowance", payslip.getMedicalAllowance());
            addTableRow(earningsTable, "Performance Bonus", payslip.getPerformanceBonus());
            
            addTotalRow(earningsTable, "Gross Earnings", payslip.getGrossEarnings());

            // Deductions Table (Right)
            Table deductionsTable = new Table(UnitValue.createPercentArray(new float[]{65F, 35F}))
                .setWidth(UnitValue.createPercentValue(100F));
            deductionsTable.addHeaderCell(createTableHeaderCell("Deductions", false));
            deductionsTable.addHeaderCell(createTableHeaderCell("Amount", true));
            
            addTableRow(deductionsTable, "Provident Fund (PF)", payslip.getProvidentFund());
            addTableRow(deductionsTable, "Professional Tax", payslip.getProfessionalTax());
            addTableRow(deductionsTable, "Income Tax (TDS)", payslip.getIncomeTax());
            addTableRow(deductionsTable, "Employee State Insurance (ESI)", payslip.getEsi());
            addBlankRow(deductionsTable);
            addBlankRow(deductionsTable);
            
            addTotalRow(deductionsTable, "Total Deductions", payslip.getTotalDeductions());

            // Add side-by-side components to the layout table
            mainTable.addCell(new Cell().add(earningsTable).setBorder(null).setPadding(0));
            mainTable.addCell(new Cell().setBorder(null).setPadding(0)); // Spacer
            mainTable.addCell(new Cell().add(deductionsTable).setBorder(null).setPadding(0));

            doc.add(mainTable);

            // ── NET TAKE-HOME SALARY BANNER ───────────────────────────
            Table bannerTable = new Table(1)
                .setWidth(UnitValue.createPercentValue(100F))
                .setMarginTop(20F)
                .setMarginBottom(20F);
            
            Cell bannerCell = new Cell()
                .setBackgroundColor(new DeviceRgb(15, 118, 110)) // #0F766E
                .setBorder(null)
                .setBorderRadius(new BorderRadius(6F))
                .setPadding(10F);
            
            Table innerBanner = new Table(UnitValue.createPercentArray(new float[]{60F, 40F}))
                .setWidth(UnitValue.createPercentValue(100F));
            
            innerBanner.addCell(new Cell()
                .add(new Paragraph("NET TAKE-HOME SALARY")
                    .setBold()
                    .setFontSize(11F)
                    .setFontColor(ColorConstants.WHITE))
                .setBorder(null)
                .setBackgroundColor(null));
            
            innerBanner.addCell(new Cell()
                .add(new Paragraph(formatIndianRupee(payslip.getNetPay()))
                    .setBold()
                    .setFontSize(22F) // 22px bold value
                    .setFontColor(ColorConstants.WHITE))
                .setBorder(null)
                .setBackgroundColor(null)
                .setTextAlignment(TextAlignment.RIGHT));
            
            bannerCell.add(innerBanner);
            bannerTable.addCell(bannerCell);
            doc.add(bannerTable);

            // ── SIGNATURES BLOCK ──────────────────────────────────────
            Table sigTable = new Table(UnitValue.createPercentArray(new float[]{50F, 50F}))
                .setWidth(UnitValue.createPercentValue(100F))
                .setMarginTop(40F);

            Cell empSig = new Cell()
                .add(new Paragraph("___________________________\nEmployee Signature")
                        .setFontSize(9F)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setFontColor(new DeviceRgb(30, 41, 59)))
                .setBorder(null);

            Cell authSig = new Cell()
                .add(new Paragraph("___________________________\nAuthorized Signatory")
                        .setFontSize(9F)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setFontColor(new DeviceRgb(30, 41, 59)))
                .setBorder(null);

            sigTable.addCell(empSig);
            sigTable.addCell(authSig);
            doc.add(sigTable);

            // ── FOOTER DISCLAIMER ─────────────────────────────────────
            doc.add(new Paragraph("\n\nThis is a computer-generated document and does not require a physical signature.")
                    .setFontSize(8F)
                    .setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER));

            doc.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return baos.toByteArray();
    }

    private Cell createDetailsCell(String text, boolean isLabel) {
        Paragraph p = new Paragraph(text != null ? text : "N/A")
            .setFontSize(9F)
            .setFontColor(isLabel ? new DeviceRgb(100, 116, 139) : new DeviceRgb(30, 41, 59));
        if (isLabel) {
            p.setBold();
        }
        return new Cell()
            .add(p)
            .setBackgroundColor(new DeviceRgb(248, 250, 252)) // #F8FAFC
            .setBorder(null)
            .setPaddingTop(6F)
            .setPaddingBottom(6F)
            .setPaddingLeft(10F)
            .setPaddingRight(10F);
    }

    private Cell createTableHeaderCell(String text, boolean isRightAligned) {
        return new Cell()
            .add(new Paragraph(text).setBold().setFontSize(9F).setFontColor(ColorConstants.WHITE))
            .setBackgroundColor(new DeviceRgb(15, 118, 110))
            .setBorder(null)
            .setTextAlignment(isRightAligned ? TextAlignment.RIGHT : TextAlignment.LEFT)
            .setPadding(6F);
    }

    private void addTableRow(Table table, String label, BigDecimal amount) {
        table.addCell(new Cell()
            .add(new Paragraph(label).setFontSize(9F).setFontColor(new DeviceRgb(30, 41, 59)))
            .setBorder(null)
            .setBorderBottom(new SolidBorder(new DeviceRgb(226, 232, 240), 1F))
            .setPadding(5F));
        
        String amountText = amount != null ? formatIndianRupee(amount) : "₹0.00";
        table.addCell(new Cell()
            .add(new Paragraph(amountText).setFontSize(9F).setFontColor(new DeviceRgb(30, 41, 59)))
            .setBorder(null)
            .setBorderBottom(new SolidBorder(new DeviceRgb(226, 232, 240), 1F))
            .setTextAlignment(TextAlignment.RIGHT)
            .setPadding(5F));
    }

    private void addBlankRow(Table table) {
        table.addCell(new Cell()
            .add(new Paragraph("").setFontSize(9F))
            .setBorder(null)
            .setBorderBottom(new SolidBorder(new DeviceRgb(226, 232, 240), 1F))
            .setPadding(5F));
        table.addCell(new Cell()
            .add(new Paragraph("").setFontSize(9F))
            .setBorder(null)
            .setBorderBottom(new SolidBorder(new DeviceRgb(226, 232, 240), 1F))
            .setPadding(5F));
    }

    private void addTotalRow(Table table, String label, BigDecimal totalAmount) {
        table.addCell(new Cell()
            .add(new Paragraph(label).setBold().setFontSize(9F).setFontColor(new DeviceRgb(30, 41, 59)))
            .setBorder(null)
            .setBorderTop(new SolidBorder(new DeviceRgb(226, 232, 240), 1.5F))
            .setBorderBottom(new SolidBorder(new DeviceRgb(226, 232, 240), 1.5F))
            .setBackgroundColor(new DeviceRgb(248, 250, 252))
            .setPadding(6F));
        
        String totalText = totalAmount != null ? formatIndianRupee(totalAmount) : "₹0.00";
        table.addCell(new Cell()
            .add(new Paragraph(totalText).setBold().setFontSize(9F).setFontColor(new DeviceRgb(30, 41, 59)))
            .setBorder(null)
            .setBorderTop(new SolidBorder(new DeviceRgb(226, 232, 240), 1.5F))
            .setBorderBottom(new SolidBorder(new DeviceRgb(226, 232, 240), 1.5F))
            .setBackgroundColor(new DeviceRgb(248, 250, 252))
            .setTextAlignment(TextAlignment.RIGHT)
            .setPadding(6F));
    }

    // ── MASKING HELPERS ───────────────────────────────────────────
    private String maskBankAccount(String acc) {
        if (acc == null) return "N/A";
        String clean = acc.trim();
        if (clean.length() < 4) return clean;
        return "********" + clean.substring(clean.length() - 4);
    }

    private String maskPan(String pan) {
        if (pan == null) return "N/A";
        String clean = pan.trim();
        if (clean.length() < 4) return clean;
        return "******" + clean.substring(clean.length() - 4);
    }

    private String maskUan(String uan) {
        if (uan == null) return "N/A";
        String clean = uan.trim();
        if (clean.length() < 4) return clean;
        return "********" + clean.substring(clean.length() - 4);
    }

    // ── INDIAN RUPEE FORMATTER (Lakh/Crore Grouping System) ───────
    public static String formatIndianRupee(BigDecimal amount) {
        if (amount == null) return "₹0.00";
        boolean isNegative = amount.compareTo(BigDecimal.ZERO) < 0;
        BigDecimal absAmount = amount.abs().setScale(2, RoundingMode.HALF_UP);
        String str = absAmount.toPlainString();
        String[] parts = str.split("\\.");
        String integerPart = parts[0];
        String decimalPart = parts.length > 1 ? parts[1] : "00";

        StringBuilder sb = new StringBuilder();
        int len = integerPart.length();
        if (len <= 3) {
            sb.append(integerPart);
        } else {
            String lastThree = integerPart.substring(len - 3);
            String remaining = integerPart.substring(0, len - 3);
            sb.append(lastThree);
            
            int remLen = remaining.length();
            for (int i = remLen - 2; i >= -1; i -= 2) {
                if (i >= 0) {
                    sb.insert(0, remaining.substring(i, i + 2) + ",");
                } else if (i == -1) {
                    sb.insert(0, remaining.substring(0, 1) + ",");
                }
            }
        }
        String formattedInt = sb.toString();
        if (formattedInt.startsWith(",")) {
            formattedInt = formattedInt.substring(1);
        }
        return (isNegative ? "-₹" : "₹") + formattedInt + "." + decimalPart;
    }
}
