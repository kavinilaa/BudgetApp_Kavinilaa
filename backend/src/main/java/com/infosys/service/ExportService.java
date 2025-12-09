package com.infosys.service;

import com.infosys.model.User;
import com.infosys.model.Income;
import com.infosys.model.Expense;
import com.infosys.repository.UserRepository;
import com.infosys.repository.IncomeRepository;
import com.infosys.repository.ExpenseRepository;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.opencsv.CSVWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExportService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private IncomeRepository incomeRepository;
    
    @Autowired
    private ExpenseRepository expenseRepository;

    public byte[] exportToPDF(String email) {
        try {
            User user = userRepository.findByEmail(email).orElseThrow();
            List<Income> incomes = incomeRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
            List<Expense> expenses = expenseRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Title
            document.add(new Paragraph("Financial Report - " + user.getFullName())
                    .setFontSize(20).setBold());
            document.add(new Paragraph("Generated on: " + 
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                    .setFontSize(12));
            document.add(new Paragraph(" "));

            // Income Section
            document.add(new Paragraph("INCOME TRANSACTIONS").setFontSize(16).setBold());
            Table incomeTable = new Table(4);
            incomeTable.addHeaderCell(new Cell().add(new Paragraph("Date").setBold()));
            incomeTable.addHeaderCell(new Cell().add(new Paragraph("Amount").setBold()));
            incomeTable.addHeaderCell(new Cell().add(new Paragraph("Category").setBold()));
            incomeTable.addHeaderCell(new Cell().add(new Paragraph("Description").setBold()));

            double totalIncome = 0;
            for (Income income : incomes) {
                incomeTable.addCell(income.getTransactionDate());
                incomeTable.addCell("₹" + income.getAmount());
                incomeTable.addCell(income.getCategory());
                incomeTable.addCell(income.getDescription());
                totalIncome += income.getAmount();
            }
            document.add(incomeTable);
            document.add(new Paragraph("Total Income: ₹" + totalIncome).setBold());
            document.add(new Paragraph(" "));

            // Expense Section
            document.add(new Paragraph("EXPENSE TRANSACTIONS").setFontSize(16).setBold());
            Table expenseTable = new Table(4);
            expenseTable.addHeaderCell(new Cell().add(new Paragraph("Date").setBold()));
            expenseTable.addHeaderCell(new Cell().add(new Paragraph("Amount").setBold()));
            expenseTable.addHeaderCell(new Cell().add(new Paragraph("Category").setBold()));
            expenseTable.addHeaderCell(new Cell().add(new Paragraph("Description").setBold()));

            double totalExpenses = 0;
            for (Expense expense : expenses) {
                expenseTable.addCell(expense.getTransactionDate());
                expenseTable.addCell("₹" + expense.getAmount());
                expenseTable.addCell(expense.getCategory());
                expenseTable.addCell(expense.getDescription());
                totalExpenses += expense.getAmount();
            }
            document.add(expenseTable);
            document.add(new Paragraph("Total Expenses: ₹" + totalExpenses).setBold());
            document.add(new Paragraph("Net Savings: ₹" + (totalIncome - totalExpenses)).setBold());

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    public String exportToCSV(String email) {
        try {
            User user = userRepository.findByEmail(email).orElseThrow();
            List<Income> incomes = incomeRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
            List<Expense> expenses = expenseRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

            StringWriter stringWriter = new StringWriter();
            CSVWriter csvWriter = new CSVWriter(stringWriter);

            // Header
            csvWriter.writeNext(new String[]{"Type", "Date", "Amount", "Category", "Description"});

            // Income data
            for (Income income : incomes) {
                csvWriter.writeNext(new String[]{
                    "Income",
                    income.getTransactionDate(),
                    income.getAmount().toString(),
                    income.getCategory(),
                    income.getDescription()
                });
            }

            // Expense data
            for (Expense expense : expenses) {
                csvWriter.writeNext(new String[]{
                    "Expense",
                    expense.getTransactionDate(),
                    expense.getAmount().toString(),
                    expense.getCategory(),
                    expense.getDescription()
                });
            }

            csvWriter.close();
            return stringWriter.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error generating CSV", e);
        }
    }
}