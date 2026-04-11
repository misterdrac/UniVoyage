package com.univoyage.auth.controller;

import com.univoyage.auth.dto.GoogleCallbackRequestDto;
import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.security.AuthCookieWriter;
import com.univoyage.auth.service.GoogleOAuthService;
import com.univoyage.auth.service.RefreshTokenService;
import com.univoyage.common.response.ApiResponse;
import com.univoyage.user.repository.UserRepository;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller for Google OAuth 2.0: redirect to Google and callback that sets the same auth cookies as password login.
 */
@CrossOrigin(
        origins = {"http://localhost:5173","http://127.0.0.1:5173"},
        allowCredentials = "true"
)
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class GoogleOAuthController {

    private final GoogleOAuthService googleOAuthService;
    private final RefreshTokenService refreshTokenService;
    private final AuthCookieWriter authCookieWriter;
    private final UserRepository userRepository;

    @GetMapping("/google")
    public void googleAuth(HttpServletResponse response) throws IOException {
        String url = googleOAuthService.buildAuthorizationUrl();
        response.sendRedirect(url);
    }

    @PostMapping("/google/callback")
    public ResponseEntity<ApiResponse<AuthPayload>> googleCallback(
            @RequestBody GoogleCallbackRequestDto request,
            HttpServletResponse response
    ) {
        log.debug("Google OAuth callback received");
        if (request.getCode() == null || request.getCode().isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail("Missing authorization code"));
        }

        AuthPayload payload = googleOAuthService.handleCallback(request.getCode());

        if (!payload.isSuccess()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.fail(payload.getError() != null ? payload.getError() : "Google login failed"));
        }

        var user = userRepository.findById(payload.getUser().getId())
                .orElseThrow(() -> new IllegalStateException("User not found after Google auth"));
        String refreshRaw = refreshTokenService.issueRefreshToken(user);
        authCookieWriter.writeAuthCookies(response, payload.getToken(), payload.getCsrfToken(), refreshRaw);

        return ResponseEntity.ok(ApiResponse.ok(payload));
    }
}
