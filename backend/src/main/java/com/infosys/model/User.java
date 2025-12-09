package com.infosys.model;

import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String email;
    
    @Column(name = "full_name")
    private String fullName;
    
    private String mobile;
    
    @Column(name = "monthly_income")
    private String monthlyIncome;
    
    @Column(name = "preferred_currency")
    private String preferredCurrency;
    
    @Column(name = "financial_goal")
    private String financialGoal;
    
    @Column(name = "financial_score")
    private Integer financialScore;
    
    @Column(name = "profile_image", columnDefinition = "LONGTEXT")
    private String profileImage;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public User() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    
    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    
    public String getMonthlyIncome() { return monthlyIncome; }
    public void setMonthlyIncome(String monthlyIncome) { this.monthlyIncome = monthlyIncome; }
    
    public String getPreferredCurrency() { return preferredCurrency; }
    public void setPreferredCurrency(String preferredCurrency) { this.preferredCurrency = preferredCurrency; }
    
    public String getFinancialGoal() { return financialGoal; }
    public void setFinancialGoal(String financialGoal) { this.financialGoal = financialGoal; }
    
    public Integer getFinancialScore() { return financialScore; }
    public void setFinancialScore(Integer financialScore) { this.financialScore = financialScore; }
}