package com.infosys.controller;

import com.infosys.model.User;
import com.infosys.model.Income;
import com.infosys.model.Expense;
import com.infosys.model.Budget;
import com.infosys.repository.UserRepository;
import com.infosys.repository.IncomeRepository;
import com.infosys.repository.ExpenseRepository;
import com.infosys.repository.BudgetRepository;
import com.infosys.config.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.layout.properties.UnitValue;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/export")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Export", description = "Data export endpoints")
public class ExportController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private IncomeRepository incomeRepository;
    
    @Autowired
    private ExpenseRepository expenseRepository;
    
    @Autowired
    private BudgetRepository budgetRepository;
    
    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/csv")
    @Operation(summary = "Export financial data to CSV")
    public ResponseEntity<String> exportToCSV(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String email = jwtUtil.extractEmail(jwt);
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Long userId = user.getId();
            
            // Fetch data
            List<Income> incomes = incomeRepository.findByUserId(userId);
            List<Expense> expenses = expenseRepository.findByUserId(userId);
            List<Budget> budgets = budgetRepository.findByUserId(userId);
            
            // Build CSV
            StringBuilder csv = new StringBuilder();
            
            // Header
            csv.append("Financial Report - ").append(user.getName()).append("\n");
            csv.append("Generated: ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).append("\n\n");
            
            // Incomes section
            csv.append("INCOMES\n");
            csv.append("Date,Category,Amount,Description\n");
            for (Income income : incomes) {
                csv.append(income.getCreatedAt() != null ? income.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) : "N/A").append(",");
                csv.append(income.getCategory() != null ? income.getCategory() : "N/A").append(",");
                csv.append(income.getAmount() != null ? income.getAmount() : "0").append(",");
                csv.append(income.getDescription() != null ? "\"" + income.getDescription().replace("\"", "\"\"") + "\"" : "N/A").append("\n");
            }
            
            csv.append("\n");
            
            // Expenses section
            csv.append("EXPENSES\n");
            csv.append("Date,Category,Amount,Description\n");
            for (Expense expense : expenses) {
                csv.append(expense.getCreatedAt() != null ? expense.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) : "N/A").append(",");
                csv.append(expense.getCategory() != null ? expense.getCategory() : "N/A").append(",");
                csv.append(expense.getAmount() != null ? expense.getAmount() : "0").append(",");
                csv.append(expense.getDescription() != null ? "\"" + expense.getDescription().replace("\"", "\"\"") + "\"" : "N/A").append("\n");
            }
            
            csv.append("\n");
            
            // Budgets section
            csv.append("BUDGETS\n");
            csv.append("Month,Year,Category,Budget Amount,Spent Amount\n");
            for (Budget budget : budgets) {
                csv.append(budget.getMonth() != null ? budget.getMonth() : "N/A").append(",");
                csv.append(budget.getYear() != null ? budget.getYear() : "N/A").append(",");
                csv.append(budget.getCategory() != null ? budget.getCategory() : "N/A").append(",");
                csv.append(budget.getBudgetAmount() != null ? budget.getBudgetAmount() : "0").append(",");
                csv.append(budget.getSpentAmount() != null ? budget.getSpentAmount() : "0").append("\n");
            }
            
            String filename = "financial_data_" + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csv.toString());
                    
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Error exporting CSV: " + e.getMessage());
        }
    }

    @GetMapping("/pdf")
    @Operation(summary = "Export financial data to PDF")
    public ResponseEntity<byte[]> exportToPDF(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String email = jwtUtil.extractEmail(jwt);
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Long userId = user.getId();
            
            // Fetch data
            List<Income> incomes = incomeRepository.findByUserId(userId);
            List<Expense> expenses = expenseRepository.findByUserId(userId);
            List<Budget> budgets = budgetRepository.findByUserId(userId);
            
            // Create PDF using iText
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);
            
            // Define colors
            DeviceRgb primaryColor = new DeviceRgb(26, 35, 126);
            DeviceRgb lightBlue = new DeviceRgb(232, 234, 246);
            
            // Title
            Paragraph title = new Paragraph("Financial Report - " + user.getName())
                    .setFontSize(24)
                    .setBold()
                    .setFontColor(primaryColor)
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(title);
            
            // Generated date
            Paragraph date = new Paragraph("Generated: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            document.add(date);
            
            // Summary
            double totalIncome = incomes.stream().mapToDouble(Income::getAmount).sum();
            double totalExpense = expenses.stream().mapToDouble(Expense::getAmount).sum();
            double balance = totalIncome - totalExpense;
            
            document.add(new Paragraph("Financial Summary")
                    .setFontSize(16)
                    .setBold()
                    .setFontColor(primaryColor)
                    .setMarginTop(10));
            
            document.add(new Paragraph("Total Income: $" + String.format("%.2f", totalIncome)));
            document.add(new Paragraph("Total Expenses: $" + String.format("%.2f", totalExpense)));
            document.add(new Paragraph("Balance: $" + String.format("%.2f", balance))
                    .setBold()
                    .setFontSize(14)
                    .setMarginBottom(15));
            
            // Income Records
            document.add(new Paragraph("Income Records (" + incomes.size() + ")")
                    .setFontSize(16)
                    .setBold()
                    .setFontColor(primaryColor)
                    .setMarginTop(15));
            
            if (!incomes.isEmpty()) {
                Table incomeTable = new Table(UnitValue.createPercentArray(new float[]{2, 2, 2, 4}));
                incomeTable.setWidth(UnitValue.createPercentValue(100));
                
                // Headers
                incomeTable.addHeaderCell(new Cell().add(new Paragraph("Date").setBold()).setBackgroundColor(lightBlue));
                incomeTable.addHeaderCell(new Cell().add(new Paragraph("Category").setBold()).setBackgroundColor(lightBlue));
                incomeTable.addHeaderCell(new Cell().add(new Paragraph("Amount").setBold()).setBackgroundColor(lightBlue));
                incomeTable.addHeaderCell(new Cell().add(new Paragraph("Description").setBold()).setBackgroundColor(lightBlue));
                
                // Data
                for (Income income : incomes) {
                    incomeTable.addCell(income.getCreatedAt() != null ? income.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) : "N/A");
                    incomeTable.addCell(income.getCategory() != null ? income.getCategory() : "N/A");
                    incomeTable.addCell("$" + String.format("%.2f", income.getAmount()));
                    incomeTable.addCell(income.getDescription() != null ? income.getDescription() : "N/A");
                }
                
                document.add(incomeTable);
            } else {
                document.add(new Paragraph("No income records found.").setItalic());
            }
            
            // Expense Records
            document.add(new Paragraph("Expense Records (" + expenses.size() + ")")
                    .setFontSize(16)
                    .setBold()
                    .setFontColor(primaryColor)
                    .setMarginTop(15));
            
            if (!expenses.isEmpty()) {
                Table expenseTable = new Table(UnitValue.createPercentArray(new float[]{2, 2, 2, 4}));
                expenseTable.setWidth(UnitValue.createPercentValue(100));
                
                // Headers
                expenseTable.addHeaderCell(new Cell().add(new Paragraph("Date").setBold()).setBackgroundColor(lightBlue));
                expenseTable.addHeaderCell(new Cell().add(new Paragraph("Category").setBold()).setBackgroundColor(lightBlue));
                expenseTable.addHeaderCell(new Cell().add(new Paragraph("Amount").setBold()).setBackgroundColor(lightBlue));
                expenseTable.addHeaderCell(new Cell().add(new Paragraph("Description").setBold()).setBackgroundColor(lightBlue));
                
                // Data
                for (Expense expense : expenses) {
                    expenseTable.addCell(expense.getCreatedAt() != null ? expense.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) : "N/A");
                    expenseTable.addCell(expense.getCategory() != null ? expense.getCategory() : "N/A");
                    expenseTable.addCell("$" + String.format("%.2f", expense.getAmount()));
                    expenseTable.addCell(expense.getDescription() != null ? expense.getDescription() : "N/A");
                }
                
                document.add(expenseTable);
            } else {
                document.add(new Paragraph("No expense records found.").setItalic());
            }
            
            // Budget Summary
            document.add(new Paragraph("Budget Summary (" + budgets.size() + ")")
                    .setFontSize(16)
                    .setBold()
                    .setFontColor(primaryColor)
                    .setMarginTop(15));
            
            if (!budgets.isEmpty()) {
                Table budgetTable = new Table(UnitValue.createPercentArray(new float[]{2, 2, 2, 2, 2}));
                budgetTable.setWidth(UnitValue.createPercentValue(100));
                
                // Headers
                budgetTable.addHeaderCell(new Cell().add(new Paragraph("Month/Year").setBold()).setBackgroundColor(lightBlue));
                budgetTable.addHeaderCell(new Cell().add(new Paragraph("Category").setBold()).setBackgroundColor(lightBlue));
                budgetTable.addHeaderCell(new Cell().add(new Paragraph("Budget").setBold()).setBackgroundColor(lightBlue));
                budgetTable.addHeaderCell(new Cell().add(new Paragraph("Spent").setBold()).setBackgroundColor(lightBlue));
                budgetTable.addHeaderCell(new Cell().add(new Paragraph("Remaining").setBold()).setBackgroundColor(lightBlue));
                
                // Data
                for (Budget budget : budgets) {
                    double remaining = budget.getBudgetAmount().doubleValue() - budget.getSpentAmount().doubleValue();
                    budgetTable.addCell(budget.getMonth() + "/" + budget.getYear());
                    budgetTable.addCell(budget.getCategory());
                    budgetTable.addCell("$" + budget.getBudgetAmount());
                    budgetTable.addCell("$" + budget.getSpentAmount());
                    budgetTable.addCell("$" + String.format("%.2f", remaining));
                }
                
                document.add(budgetTable);
            } else {
                document.add(new Paragraph("No budget records found.").setItalic());
            }
            
            document.close();
            
            byte[] pdfBytes = baos.toByteArray();
            
            String filename = "financial_report_" + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf";
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
                    
        } catch (Exception e) {
            String errorHtml = "<html><body><h1>Error generating report</h1><p>" + e.getMessage() + "</p></body></html>";
            return ResponseEntity.status(500)
                    .contentType(MediaType.TEXT_HTML)
                    .body(errorHtml.getBytes());
        }
    }
    
    @GetMapping("/odf")
    @Operation(summary = "Export financial data to ODF")
    public ResponseEntity<String> exportToODF(@RequestHeader("Authorization") String token) {
        try {
            // ODF export returns CSV format which can be opened in LibreOffice
            return exportToCSV(token);
                    
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("Error exporting ODF: " + e.getMessage());
        }
    }
}