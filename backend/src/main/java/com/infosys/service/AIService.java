package com.infosys.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.Map;

@Service
public class AIService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String OLLAMA_URL = "http://localhost:11434/api/generate";

    public String getAIResponse(String message) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = Map.of(
                "model", "llama3.2",
                "prompt", "You are a financial advisor. Give a short, simple answer about: " + message + ". Use 3-5 bullet points maximum. Keep it under 100 words. Be direct and practical.",
                "stream", false
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(OLLAMA_URL, entity, Map.class);
            
            return (String) response.get("response");
        } catch (Exception e) {
            return "I'm currently unable to process your request. Please make sure Ollama is running with the llama3.2 model.";
        }
    }
}