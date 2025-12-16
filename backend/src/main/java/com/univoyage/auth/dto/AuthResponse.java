package com.univoyage.auth.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {
    private final String token;      // The JWT (Token A)
    private final String csrfSecret; // The client-side secret (Token B)
}