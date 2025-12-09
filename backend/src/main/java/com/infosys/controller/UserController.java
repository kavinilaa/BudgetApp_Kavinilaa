package com.infosys.controller;

import com.infosys.model.User;
import com.infosys.model.Profile;
import com.infosys.repository.*;
import com.infosys.config.JwtUtil;
import com.infosys.dto.ProfileRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "User Profile", description = "User profile management endpoints")
public class UserController {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProfileRepository profileRepository;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private IncomeRepository incomeRepository;
    
    @Autowired
    private ExpenseRepository expenseRepository;
    
    @Autowired
    private BudgetRepository budgetRepository;
    
    @Autowired
    private SavingsGoalRepository savingsGoalRepository;

    @GetMapping("/profile")
    @Operation(summary = "Get user profile", description = "Retrieve user profile information")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String email = jwtUtil.extractEmail(jwt);
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid token");
        }
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user profile", description = "Update user profile information")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> updateProfile(
            @RequestHeader("Authorization") String token,
            @RequestBody User updatedUser) {
        try {
            String jwt = token.substring(7);
            String email = jwtUtil.extractEmail(jwt);
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (updatedUser.getFullName() != null && !updatedUser.getFullName().isEmpty()) {
                user.setFullName(updatedUser.getFullName());
            }
            if (updatedUser.getEmail() != null && !updatedUser.getEmail().isEmpty()) {
                user.setEmail(updatedUser.getEmail());
            }
            if (updatedUser.getMobile() != null) {
                user.setMobile(updatedUser.getMobile());
            }
            if (updatedUser.getMonthlyIncome() != null) {
                user.setMonthlyIncome(updatedUser.getMonthlyIncome());
            }
            if (updatedUser.getPreferredCurrency() != null) {
                user.setPreferredCurrency(updatedUser.getPreferredCurrency());
            }
            if (updatedUser.getFinancialGoal() != null) {
                user.setFinancialGoal(updatedUser.getFinancialGoal());
            }
            if (updatedUser.getProfileImage() != null) {
                user.setProfileImage(updatedUser.getProfileImage());
            }
            user.setUpdatedAt(LocalDateTime.now());
            
            userRepository.save(user);
            
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
    
    @DeleteMapping("/reset-data")
    @Operation(summary = "Reset all user data", description = "Delete all transactions, budgets, and savings goals for the user")
    @SecurityRequirement(name = "Bearer Authentication")
    @Transactional
    public ResponseEntity<?> resetUserData(@RequestHeader("Authorization") String token) {
        try {
            System.out.println("Reset data endpoint called");
            String jwt = token.substring(7);
            String email = jwtUtil.extractEmail(jwt);
            System.out.println("User email: " + email);
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Long userId = user.getId();
            System.out.println("User ID: " + userId);
            
            // Delete all user's financial data
            System.out.println("Deleting incomes...");
            incomeRepository.deleteByUserId(userId);
            System.out.println("Deleting expenses...");
            expenseRepository.deleteByUserId(userId);
            System.out.println("Deleting budgets...");
            budgetRepository.deleteByUserId(userId);
            System.out.println("Deleting savings goals...");
            savingsGoalRepository.deleteByUserId(userId);
            System.out.println("All data deleted successfully");
            
            return ResponseEntity.ok(new MessageResponse("All data has been reset successfully"));
        } catch (Exception e) {
            System.err.println("Error resetting data: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new MessageResponse("Error resetting data: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/delete-account")
    @Operation(summary = "Delete user account", description = "Permanently delete user account and all associated data")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> deleteAccount(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            String email = jwtUtil.extractEmail(jwt);
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Long userId = user.getId();
            
            // Delete all user's data
            incomeRepository.deleteByUserId(userId);
            expenseRepository.deleteByUserId(userId);
            budgetRepository.deleteByUserId(userId);
            savingsGoalRepository.deleteByUserId(userId);
            profileRepository.findByUserId(userId).ifPresent(profile -> profileRepository.delete(profile));
            
            // Finally delete the user account
            userRepository.delete(user);
            
            return ResponseEntity.ok(new MessageResponse("Account deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error deleting account: " + e.getMessage()));
        }
    }
    
    static class UserProfileResponse {
        private String name;
        private String email;
        private String phone;
        private String address;
        private String gender;
        private String dateOfBirth;
        private String occupation;
        
        public UserProfileResponse(User user, Profile profile) {
            this.name = user.getFullName();
            this.email = user.getEmail();
            if (profile != null) {
                this.phone = profile.getPhone();
                this.address = profile.getAddress();
                this.gender = profile.getGender();
                this.dateOfBirth = profile.getDateOfBirth();
                this.occupation = profile.getOccupation();
            }
        }
        
        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getPhone() { return phone; }
        public String getAddress() { return address; }
        public String getGender() { return gender; }
        public String getDateOfBirth() { return dateOfBirth; }
        public String getOccupation() { return occupation; }
    }
    
    static class MessageResponse {
        private String message;
        
        public MessageResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() { return message; }
    }
}