package com.infosys.service;

import com.infosys.config.JwtUtil;
import com.infosys.dto.AuthRequest;
import com.infosys.dto.AuthResponse;
import com.infosys.model.User;
import com.infosys.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
@Transactional
public class AuthService {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @PersistenceContext
    private EntityManager entityManager;

    public AuthResponse register(AuthRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        
        // Generate username from email if not provided
        String username = request.getEmail().split("@")[0];
        int counter = 1;
        String originalUsername = username;
        
        // Ensure username is unique
        while (userRepository.findByUsername(username).isPresent()) {
            username = originalUsername + counter;
            counter++;
        }
        
        User user = new User();
        user.setUsername(username);
        user.setFullName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setCreatedAt(java.time.LocalDateTime.now());
        user.setUpdatedAt(java.time.LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        String token = jwtUtil.generateToken(savedUser.getEmail());
        
        return new AuthResponse(token, "Registration successful", savedUser.getUsername(), savedUser.getId());
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, "Login successful", user.getUsername(), user.getId());
    }

    public long getUserCount() {
        return userRepository.count();
    }
}