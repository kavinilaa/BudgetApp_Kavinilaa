package com.infosys.dto;

public class AuthResponse {
    private String token;
    private String message;
    private String username;
    private Long userId;

    public AuthResponse(String token, String message) {
        this.token = token;
        this.message = message;
    }

    public AuthResponse(String token, String message, String username) {
        this.token = token;
        this.message = message;
        this.username = username;
    }

    public AuthResponse(String token, String message, String username, Long userId) {
        this.token = token;
        this.message = message;
        this.username = username;
        this.userId = userId;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}