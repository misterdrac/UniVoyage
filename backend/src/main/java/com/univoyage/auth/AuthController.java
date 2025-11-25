package com.univoyage.auth;

import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.dto.RegisterRequestDto;
import com.univoyage.auth.dto.LoginRequestDto;
import com.univoyage.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMethod;

@CrossOrigin(origins = {"http://localhost:5173","http://127.0.0.1:5173"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthPayload>> register(@Valid @RequestBody RegisterRequestDto request) {

        // binds request data (JSON) to RegisterRequest object automatically
        // @Valid triggers validation based on annotations in RegisterRequest
        // if validation fails, Spring returns 400 Bad Request with error details
        // if validation passes, we proceed to register the user
        // call AuthService to handle registration login
        AuthPayload payload = authService.register(request);

        if(!payload.isSuccess()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(payload);
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(payload);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthPayload>> login(@RequestBody LoginRequestDto request) {
        AuthPayload payload = authService.login(request);

        if(!payload.isSuccess()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(payload);
        }

        return ResponseEntity.ok(payload);
    }

    // Get current authenticated user, JWT is not issued again because we already have it
    // issueing it again would be redundant and would lead to infinite token refresh loop on client side
    @GetMapping("/me")
    public ResponseEntity<UserDto> me(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(AuthPayload.fail("Not authenticated"));
        }
        return ResponseEntity.ok(UserDto.from(user), null, null);
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthPayload> logout() {
        // Invalidate the JWT token on the client side by clearing the HttpOnly cookie
        return ResponseEntity.ok(AuthPayload.ok(null, null, null));
    }
}