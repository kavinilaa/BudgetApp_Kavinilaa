package com.infosys.controller;

import com.infosys.config.JwtUtil;
import com.infosys.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/analytics")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Analytics", description = "Financial analytics and visualization endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;
    
    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/monthly-spending")
    @Operation(summary = "Get monthly spending comparison data")
    public ResponseEntity<Map<String, Object>> getMonthlySpending(@RequestHeader(value = "Authorization", required = false) String token) {
        String email = extractEmailFromToken(token);
        return ResponseEntity.ok(analyticsService.getMonthlySpendingData(email));
    }

    @GetMapping("/category-breakdown")
    @Operation(summary = "Get category-wise spending breakdown")
    public ResponseEntity<Map<String, Object>> getCategoryBreakdown(@RequestHeader(value = "Authorization", required = false) String token) {
        String email = extractEmailFromToken(token);
        return ResponseEntity.ok(analyticsService.getCategoryBreakdownData(email));
    }

    @GetMapping("/income-vs-expenses")
    @Operation(summary = "Get income vs expenses comparison")
    public ResponseEntity<Map<String, Object>> getIncomeVsExpenses(@RequestHeader(value = "Authorization", required = false) String token) {
        String email = extractEmailFromToken(token);
        return ResponseEntity.ok(analyticsService.getIncomeVsExpensesData(email));
    }

    @GetMapping("/summary")
    @Operation(summary = "Get financial summary statistics")
    public ResponseEntity<Map<String, Object>> getSummary(@RequestHeader(value = "Authorization", required = false) String token) {
        String email = extractEmailFromToken(token);
        return ResponseEntity.ok(analyticsService.getSummaryData(email));
    }
    
    private String extractEmailFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            String jwt = token.substring(7);
            return jwtUtil.extractEmail(jwt);
        }
        throw new RuntimeException("Invalid or missing authorization token");
    }
}