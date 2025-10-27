package com.univoyage.auth.dto;

import com.univoyage.auth.user.UserDto;
import lombok.Builder;
import lombok.Value;

// DTO for authentication response payload, what returns after register/login
// contains success status, user info, token or error message
@Value @Builder
public class AuthPayload {
    boolean success;
    UserDto user;
    String token;
    String error;

    // methods for creating success and failure payloads on register/login
    public static AuthPayload ok(UserDto user, String token){
        return AuthPayload.builder().success(true).user(user).token(token).build();
    }
    public static AuthPayload fail(String error){
        return AuthPayload.builder().success(false).error(error).build();
    }
}