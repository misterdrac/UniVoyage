package com.univoyage.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for Gemini AI responses.
 * Contains fields for success status, content, and error message.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GeminiResponse {
    private boolean success;
    private String content;
    private String error;
    
    public static GeminiResponse success(String content) {
        return new GeminiResponse(true, content, null);
    }
    
    public static GeminiResponse error(String error) {
        return new GeminiResponse(false, null, error);
    }
}

