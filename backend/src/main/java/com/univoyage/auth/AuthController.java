package com.univoyage.auth;

import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.dto.RegisterRequestDto;
import com.univoyage.auth.dto.LoginRequestDto;
import com.univoyage.auth.user.dto.UserDto;
import com.univoyage.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@CrossOrigin(
        origins = {"http://localhost:5173","http://127.0.0.1:5173"},
        allowCredentials = "true"
)
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthPayload>> register(
            @Valid @RequestBody RegisterRequestDto request
    ) {
        AuthPayload payload = authService.register(request);

        if (!payload.isSuccess()) {
            // ovdje ne znamo koje sve fieldove ima AuthPayload,
            // pa šaljemo generičku poruku
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail("Registration failed"));
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(payload));
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthPayload>> login(
            @RequestBody LoginRequestDto request
    ) {
        AuthPayload payload = authService.login(request);

        if (!payload.isSuccess()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.fail("Invalid email or password"));
        }

        return ResponseEntity.ok(ApiResponse.ok(payload));
    }

    // GET /api/auth/me
    // vrati trenutno autentificiranog usera, *zamotanog* u ApiResponse
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> me(
            @AuthenticationPrincipal UserDto user
    ) {
        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.fail("Not authenticated"));
        }

        // user je već UserDto, nema nikakvog .from()
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    // POST /api/auth/logout
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        // realno, kod HttpOnly cookie pristupa klijent samo obriše cookie;
        // BE može eventualno logirati / blacklistati, ali za sad samo vraćamo OK
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
