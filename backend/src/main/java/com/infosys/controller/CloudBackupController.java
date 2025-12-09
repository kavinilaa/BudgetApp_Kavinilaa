package com.infosys.controller;

import com.infosys.config.JwtUtil;
import com.infosys.model.User;
import com.infosys.repository.UserRepository;
import com.infosys.service.ExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/cloud")
@CrossOrigin(origins = "http://localhost:3000")
public class CloudBackupController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExportService exportService;

    @GetMapping("/google/auth")
    public ResponseEntity<?> getGoogleAuthUrl() {
        String clientId = "731116306858-3kumnoe2mlsn0bhk9u9vor911vpm6sqa.apps.googleusercontent.com";
        
        String redirectUri = "http://localhost:3000";
        String scope = "https://www.googleapis.com/auth/drive.file";
        String authUrl = String.format(
            "https://accounts.google.com/o/oauth2/v2/auth?client_id=%s&redirect_uri=%s&response_type=code&scope=%s&access_type=offline",
            clientId, redirectUri, scope
        );
        
        Map<String, String> response = new HashMap<>();
        response.put("authUrl", authUrl);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/google/backup")
    public ResponseEntity<?> backupToGoogleDrive(@RequestHeader("Authorization") String token, @RequestParam String accessToken) {
        try {
            String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
            User user = userRepository.findByEmail(email).orElseThrow();
            
            // Placeholder for JSON export - implement if needed
            String jsonData = "{}";
            
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("name", "budget_backup_" + System.currentTimeMillis() + ".json");
            metadata.put("mimeType", "application/json");
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(metadata, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(
                "https://www.googleapis.com/drive/v3/files", request, String.class
            );
            
            return ResponseEntity.ok(Map.of("message", "Backup successful", "status", "success"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Backup failed: " + e.getMessage()));
        }
    }
}
