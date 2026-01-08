package com.univoyage.auth.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * Response DTO for authentication containing token and CSRF secret.
 */
@Getter
@Builder
public class AuthResponse {
    private final String token;
    private final String csrfSecret;
}