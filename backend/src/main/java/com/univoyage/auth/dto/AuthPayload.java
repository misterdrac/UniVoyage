package com.univoyage.auth.dto;

import com.univoyage.user.dto.UserDto;

import lombok.*;

/**
 * Payload returned after authentication attempts.
 * Contains success status, user details, tokens, and error messages.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthPayload {

    private boolean success;
    private UserDto user;
    private String token;
    private String csrfToken;
    private String error;

    public static AuthPayload ok(UserDto user, String token, String csrfToken) {
        return AuthPayload.builder()
                .success(true)
                .user(user)
                .token(token)
                .csrfToken(csrfToken)
                .build();
    }

    public static AuthPayload fail(String error) {
        return AuthPayload.builder()
                .success(false)
                .error(error)
                .build();
    }
}
