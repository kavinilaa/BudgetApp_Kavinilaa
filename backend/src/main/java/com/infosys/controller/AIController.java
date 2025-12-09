package com.infosys.controller;

import com.infosys.model.User;
import com.infosys.repository.*;
import com.infosys.config.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:3000")
public class AIController {
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

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestHeader("Authorization") String token, @RequestBody Map<String, String> request) {
        try {
            String jwt = token.substring(7);
            String email = jwtUtil.extractEmail(jwt);
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
            
            var incomes = incomeRepository.findByUserId(user.getId());
            var expenses = expenseRepository.findByUserId(user.getId());
            var budgets = budgetRepository.findByUserId(user.getId());
            
            double totalIncome = incomes.stream().mapToDouble(i -> i.getAmount()).sum();
            double totalExpense = expenses.stream().mapToDouble(e -> e.getAmount()).sum();
            
            String context = String.format(
                "User Financial Data:\n" +
                "- Name: %s\n" +
                "- Total Income: %.2f %s\n" +
                "- Total Expenses: %.2f %s\n" +
                "- Net Balance: %.2f %s\n" +
                "- Number of Transactions: %d incomes, %d expenses\n" +
                "- Financial Goal: %s\n\n" +
                "User Question: %s\n\n" +
                "Provide a helpful, personalized response based on their actual financial data.",
                user.getFullName() != null ? user.getFullName() : user.getUsername(),
                totalIncome, user.getPreferredCurrency() != null ? user.getPreferredCurrency() : "INR",
                totalExpense, user.getPreferredCurrency() != null ? user.getPreferredCurrency() : "INR",
                totalIncome - totalExpense, user.getPreferredCurrency() != null ? user.getPreferredCurrency() : "INR",
                incomes.size(), expenses.size(),
                user.getFinancialGoal() != null ? user.getFinancialGoal() : "Not set",
                request.get("message")
            );
            
            RestTemplate restTemplate = new RestTemplate();
            Map<String, Object> ollamaRequest = new HashMap<>();
            ollamaRequest.put("model", "llama3.2");
            ollamaRequest.put("prompt", context);
            ollamaRequest.put("stream", false);
            
            Map<String, Object> ollamaResponse = restTemplate.postForObject(
                "http://localhost:11434/api/generate",
                ollamaRequest,
                Map.class
            );
            
            String aiResponse = (String) ollamaResponse.get("response");
            return ResponseEntity.ok(Map.of("response", aiResponse));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Map.of("response", "I'm having trouble connecting. Please ensure Ollama is running."));
        }
    }
}
