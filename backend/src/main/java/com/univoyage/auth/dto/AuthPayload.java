package com.univoyage.auth.dto;

import com.univoyage.auth.user.dto.UserDto;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthPayload {

    private boolean success;
    private UserDto user;
    private String token;     // JWT (HttpOnly cookie)
    private String csrfToken; // Token B (header)
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
