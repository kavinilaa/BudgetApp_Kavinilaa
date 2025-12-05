package com.infosys.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.infosys.model.User;
import com.infosys.repository.UserRepository;
import java.util.Base64;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserProfileController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{username}")
    public ResponseEntity<?> getProfile(@PathVariable String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (!userOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(userOpt.get());
    }

    @PutMapping("/{username}")
    public ResponseEntity<?> updateProfile(@PathVariable String username, @RequestBody User updatedUser) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (!userOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        if (updatedUser.getFullName() != null) user.setFullName(updatedUser.getFullName());
        if (updatedUser.getEmail() != null) user.setEmail(updatedUser.getEmail());
        if (updatedUser.getMobile() != null) user.setMobile(updatedUser.getMobile());
        if (updatedUser.getMonthlyIncome() != null) user.setMonthlyIncome(updatedUser.getMonthlyIncome());
        if (updatedUser.getPreferredCurrency() != null) user.setPreferredCurrency(updatedUser.getPreferredCurrency());
        if (updatedUser.getFinancialGoal() != null) user.setFinancialGoal(updatedUser.getFinancialGoal());
        if (updatedUser.getFinancialScore() != null) user.setFinancialScore(updatedUser.getFinancialScore());
        
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/{username}/upload-image")
    public ResponseEntity<?> uploadProfileImage(@PathVariable String username, @RequestParam("image") MultipartFile file) {
        try {
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();
            String base64Image = Base64.getEncoder().encodeToString(file.getBytes());
            String imageData = "data:" + file.getContentType() + ";base64," + base64Image;
            
            user.setProfileImage(imageData);
            userRepository.save(user);

            return ResponseEntity.ok().body("{\"message\":\"Image uploaded successfully\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\":\"Failed to upload image\"}");
        }
    }

    @DeleteMapping("/{username}/delete-image")
    public ResponseEntity<?> deleteProfileImage(@PathVariable String username) {
        try {
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();
            user.setProfileImage(null);
            userRepository.save(user);

            return ResponseEntity.ok().body("{\"message\":\"Image deleted successfully\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\":\"Failed to delete image\"}");
        }
    }
}