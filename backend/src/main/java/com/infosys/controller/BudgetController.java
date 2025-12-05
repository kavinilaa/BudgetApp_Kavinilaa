package com.infosys.controller;

import com.infosys.model.Budget;
import com.infosys.model.SavingsGoal;
import com.infosys.model.Expense;
import com.infosys.repository.BudgetRepository;
import com.infosys.repository.SavingsGoalRepository;
import com.infosys.repository.ExpenseRepository;
import com.infosys.repository.UserRepository;
import com.infosys.config.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/budget")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Budget & Savings", description = "Budget and savings goals management")
public class BudgetController {
    
    @Autowired
    private BudgetRepository budgetRepository;
    
    @Autowired
    private SavingsGoalRepository savingsGoalRepository;
    
    @Autowired
    private ExpenseRepository expenseRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/set")
    @Operation(summary = "Set monthly budget", description = "Set budget for a category in a specific month")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> setBudget(@RequestBody BudgetRequest request, @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String email = jwtUtil.extractEmail(jwt);
            Long userId = userRepository.findByEmail(email).get().getId();
            
            Budget budget = budgetRepository.findByUserIdAndCategoryAndMonthAndYear(
                userId, request.getCategory(), request.getMonth(), request.getYear())
                .orElse(new Budget());
            
            budget.setUserId(userId);
            budget.setCategory(request.getCategory());
            budget.setBudgetAmount(request.getBudgetAmount());
            budget.setMonth(request.getMonth());
            budget.setYear(request.getYear());
            budget.setUpdatedAt(LocalDateTime.now());
            
            budgetRepository.save(budget);
            return ResponseEntity.ok(new MessageResponse("Budget set successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/monthly/{month}/{year}")
    @Operation(summary = "Get monthly budgets", description = "Get all budgets for a specific month")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> getMonthlyBudgets(@PathVariable Integer month, @PathVariable Integer year, @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String email = jwtUtil.extractEmail(jwt);
            Long userId = userRepository.findByEmail(email).get().getId();
            
            List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);
            return ResponseEntity.ok(budgets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/savings-goal")
    @Operation(summary = "Create savings goal", description = "Create a new savings goal")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> createSavingsGoal(@RequestBody SavingsGoalRequest request, @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String email = jwtUtil.extractEmail(jwt);
            Long userId = userRepository.findByEmail(email).get().getId();
            
            SavingsGoal goal = new SavingsGoal();
            goal.setUserId(userId);
            goal.setGoalName(request.getGoalName());
            goal.setTargetAmount(request.getTargetAmount());
            goal.setTargetDate(request.getTargetDate());
            
            SavingsGoal savedGoal = savingsGoalRepository.save(goal);
            return ResponseEntity.ok(savedGoal);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/savings-goals")
    @Operation(summary = "Get savings goals", description = "Get all user savings goals")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> getSavingsGoals(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String email = jwtUtil.extractEmail(jwt);
            Long userId = userRepository.findByEmail(email).get().getId();
            
            List<SavingsGoal> goals = savingsGoalRepository.findByUserId(userId);
            return ResponseEntity.ok(goals);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/update/{id}")
    @Operation(summary = "Update budget", description = "Update existing budget")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> updateBudget(@PathVariable Long id, @RequestBody BudgetRequest request, @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String email = jwtUtil.extractEmail(jwt);
            Long userId = userRepository.findByEmail(email).get().getId();
            
            Budget budget = budgetRepository.findById(id).orElseThrow(() -> new RuntimeException("Budget not found"));
            if (!budget.getUserId().equals(userId)) {
                throw new RuntimeException("Unauthorized");
            }
            
            budget.setCategory(request.getCategory());
            budget.setBudgetAmount(request.getBudgetAmount());
            budget.setMonth(request.getMonth());
            budget.setYear(request.getYear());
            budget.setUpdatedAt(LocalDateTime.now());
            
            budgetRepository.save(budget);
            return ResponseEntity.ok(new MessageResponse("Budget updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/delete/{id}")
    @Operation(summary = "Delete budget", description = "Delete existing budget")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> deleteBudget(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String email = jwtUtil.extractEmail(jwt);
            Long userId = userRepository.findByEmail(email).get().getId();
            
            Budget budget = budgetRepository.findById(id).orElseThrow(() -> new RuntimeException("Budget not found"));
            if (!budget.getUserId().equals(userId)) {
                throw new RuntimeException("Unauthorized");
            }
            
            budgetRepository.deleteById(id);
            return ResponseEntity.ok(new MessageResponse("Budget deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/savings-goal/update/{id}")
    @Operation(summary = "Update savings goal", description = "Update existing savings goal")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> updateSavingsGoal(@PathVariable Long id, @RequestBody SavingsGoalRequest request, @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String email = jwtUtil.extractEmail(jwt);
            Long userId = userRepository.findByEmail(email).get().getId();
            
            SavingsGoal goal = savingsGoalRepository.findById(id).orElseThrow(() -> new RuntimeException("Savings goal not found"));
            if (!goal.getUserId().equals(userId)) {
                throw new RuntimeException("Unauthorized");
            }
            
            goal.setGoalName(request.getGoalName());
            goal.setTargetAmount(request.getTargetAmount());
            goal.setTargetDate(request.getTargetDate());
            goal.setUpdatedAt(LocalDateTime.now());
            
            savingsGoalRepository.save(goal);
            return ResponseEntity.ok(new MessageResponse("Savings goal updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/savings-goal/delete/{id}")
    @Operation(summary = "Delete savings goal", description = "Delete existing savings goal")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> deleteSavingsGoal(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String email = jwtUtil.extractEmail(jwt);
            Long userId = userRepository.findByEmail(email).get().getId();
            
            SavingsGoal goal = savingsGoalRepository.findById(id).orElseThrow(() -> new RuntimeException("Savings goal not found"));
            if (!goal.getUserId().equals(userId)) {
                throw new RuntimeException("Unauthorized");
            }
            
            savingsGoalRepository.deleteById(id);
            return ResponseEntity.ok(new MessageResponse("Savings goal deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/savings-goal/{id}/add")
    @Operation(summary = "Add money to savings goal", description = "Add money to an existing savings goal")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> addToSavingsGoal(
            @PathVariable Long id,
            @RequestBody SavingsTransferRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String email = jwtUtil.extractEmail(jwt);
            Long userId = userRepository.findByEmail(email).get().getId();
            
            SavingsGoal goal = savingsGoalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Savings goal not found"));
            
            if (!goal.getUserId().equals(userId)) {
                throw new RuntimeException("Unauthorized");
            }
            
            // Update savings goal
            goal.setCurrentAmount(goal.getCurrentAmount().add(request.getAmount()));
            goal.setUpdatedAt(LocalDateTime.now());
            savingsGoalRepository.save(goal);
            
            return ResponseEntity.ok(new MessageResponse("Amount added to savings goal successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/savings-transfer")
    @Operation(summary = "Transfer money to savings goal", description = "Manually add money to a specific savings goal and record as expense")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> transferToSavings(@RequestBody SavingsTransferRequest request, @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String email = jwtUtil.extractEmail(jwt);
            Long userId = userRepository.findByEmail(email).get().getId();
            
            SavingsGoal goal = savingsGoalRepository.findById(request.getGoalId())
                .orElseThrow(() -> new RuntimeException("Savings goal not found"));
            
            if (!goal.getUserId().equals(userId)) {
                throw new RuntimeException("Unauthorized");
            }
            
            // Update savings goal
            goal.setCurrentAmount(goal.getCurrentAmount().add(request.getAmount()));
            goal.setUpdatedAt(LocalDateTime.now());
            savingsGoalRepository.save(goal);
            
            // Create expense transaction
            Expense expense = new Expense();
            expense.setUserId(userId);
            expense.setAmount(request.getAmount().doubleValue());
            expense.setDescription(request.getDescription() != null ? request.getDescription() : "Savings Transfer");
            expense.setCategory("Savings");
            expense.setTransactionDate(LocalDate.now().toString());
            expense.setCreatedAt(LocalDateTime.now());
            expenseRepository.save(expense);
            
            return ResponseEntity.ok(new MessageResponse("Money transferred to savings goal successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    static class BudgetRequest {
        private String category;
        private java.math.BigDecimal budgetAmount;
        private Integer month;
        private Integer year;
        
        public String getCategory() { return category; }
        public java.math.BigDecimal getBudgetAmount() { return budgetAmount; }
        public Integer getMonth() { return month; }
        public Integer getYear() { return year; }
    }

    static class SavingsGoalRequest {
        private String goalName;
        private java.math.BigDecimal targetAmount;
        private java.time.LocalDate targetDate;
        
        public String getGoalName() { return goalName; }
        public java.math.BigDecimal getTargetAmount() { return targetAmount; }
        public java.time.LocalDate getTargetDate() { return targetDate; }
    }

    static class SavingsTransferRequest {
        private Long goalId;
        private java.math.BigDecimal amount;
        private String description;
        
        public Long getGoalId() { return goalId; }
        public java.math.BigDecimal getAmount() { return amount; }
        public String getDescription() { return description; }
    }

    static class MessageResponse {
        private String message;
        public MessageResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
    }
}