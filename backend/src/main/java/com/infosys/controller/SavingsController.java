package com.infosys.controller;

import com.infosys.config.JwtUtil;
import com.infosys.model.Savings;
import com.infosys.model.User;
import com.infosys.model.Expense;
import com.infosys.repository.SavingsRepository;
import com.infosys.repository.UserRepository;
import com.infosys.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/savings")
@CrossOrigin(origins = "http://localhost:3000")
public class SavingsController {

    @Autowired
    private SavingsRepository savingsRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<Savings>> getAllSavings(@RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
            User user = userRepository.findByEmail(email).orElseThrow();
            List<Savings> savings = savingsRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
            return ResponseEntity.ok(savings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<Savings> addSavings(@RequestHeader("Authorization") String token, @RequestBody Map<String, Object> request) {
        try {
            String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
            User user = userRepository.findByEmail(email).orElseThrow();

            Savings savings = new Savings();
            savings.setUserId(user.getId());
            savings.setGoalName((String) request.get("goalName"));
            savings.setAmount(new BigDecimal(request.get("amount").toString()));
            savings.setTargetAmount(new BigDecimal(request.get("targetAmount").toString()));
            savings.setDescription((String) request.get("description"));
            savings.setCreatedAt(LocalDateTime.now());
            savings.setUpdatedAt(LocalDateTime.now());

            Savings savedSavings = savingsRepository.save(savings);
            
            // Create expense transaction for savings transfer
            createSavingsExpenseTransaction(user.getId(), savings.getAmount(), savings.getGoalName(), savings.getDescription());
            
            return ResponseEntity.ok(savedSavings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    private void createSavingsExpenseTransaction(Long userId, BigDecimal amount, String goalName, String description) {
        try {
            Expense expense = new Expense();
            expense.setUserId(userId);
            expense.setAmount(amount.doubleValue());
            expense.setCategory("Savings");
            expense.setDescription("Transfer to " + goalName + (description != null && !description.isEmpty() ? " - " + description : ""));
            expense.setTransactionDate(LocalDateTime.now().toString());
            expense.setCreatedAt(LocalDateTime.now());
            
            expenseRepository.save(expense);
            System.out.println("Created savings expense transaction: " + amount + " for " + goalName);
        } catch (Exception e) {
            System.err.println("Failed to create expense transaction for savings: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Savings> updateSavings(@RequestHeader("Authorization") String token, @PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
            
            Savings savings = savingsRepository.findById(id).orElseThrow(() -> new RuntimeException("Savings not found"));
            if (!savings.getUserId().equals(user.getId())) {
                return ResponseEntity.status(403).build();
            }
            
            savings.setGoalName((String) request.get("goalName"));
            savings.setAmount(new BigDecimal(request.get("amount").toString()));
            savings.setTargetAmount(new BigDecimal(request.get("targetAmount").toString()));
            savings.setDescription((String) request.get("description"));
            savings.setUpdatedAt(LocalDateTime.now());
            
            Savings updatedSavings = savingsRepository.save(savings);
            return ResponseEntity.ok(updatedSavings);
        } catch (Exception e) {
            System.err.println("Error updating savings: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteSavings(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        try {
            String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
            User user = userRepository.findByEmail(email).orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            // Find savings by user to ensure ownership
            List<Savings> userSavings = savingsRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
            Savings targetSaving = userSavings.stream()
                .filter(s -> s.getId().equals(id))
                .findFirst()
                .orElse(null);
            
            if (targetSaving == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Savings not found or access denied"));
            }
            
            // Simple delete
            savingsRepository.deleteById(id);
            
            return ResponseEntity.ok(Map.of("message", "Savings deleted successfully"));
        } catch (Exception e) {
            System.err.println("Error deleting savings ID " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete: " + e.getMessage()));
        }
    }

    @GetMapping("/total")
    public ResponseEntity<Map<String, BigDecimal>> getTotalSavings(@RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
            User user = userRepository.findByEmail(email).orElseThrow();
            BigDecimal total = savingsRepository.getTotalSavingsByUserId(user.getId());
            return ResponseEntity.ok(Map.of("total", total != null ? total : BigDecimal.ZERO));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}