package com.univoyage.auth.controller;

import com.univoyage.auth.dto.GoogleCallbackRequestDto;
import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.security.CookieUtils;
import com.univoyage.auth.service.GoogleOAuthService;
import com.univoyage.common.response.ApiResponse;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/** * Controller for handling Google OAuth 2.0 authentication.
 * Provides endpoints to initiate the OAuth flow and handle the callback.
 * All endpoints are prefixed with /api/auth.
 * Uses GoogleOAuthService for business logic.
 * Returns responses wrapped in ApiResponse for consistent API structure.
 * Sets HttpOnly cookies for JWT and CSRF tokens upon successful authentication.
 * Supports CORS for specified frontend origins.
 * Handles errors and returns appropriate HTTP status codes.
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

    @Value("${app.jwt.ttl-seconds}")
    private long jwtTtlSeconds;

    /** Redirects the user to Google's OAuth 2.0 authorization endpoint.
     *
     * @param response The HTTP response to send the redirect.
     * @throws IOException If an input or output exception occurs.
     */
    @GetMapping("/google")
    public void googleAuth(HttpServletResponse response) throws IOException {
        String url = googleOAuthService.buildAuthorizationUrl();
        response.sendRedirect(url);
    }

    /** Handles the OAuth 2.0 callback from Google.
     *
     * @param request The request body containing the authorization code.
     * @param response The HTTP response to set cookies.
     * @return A ResponseEntity containing the authentication payload or an error message.
     */
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

        // Same cookie setting as /login and /register
        if (payload.getToken() != null) {
            ResponseCookie jwtCookie = ResponseCookie.from(CookieUtils.JWT_COOKIE_NAME, payload.getToken())
                    .httpOnly(true)
                    .secure(false)
                    .path("/")
                    .maxAge((int) jwtTtlSeconds)
                    .sameSite("Lax")
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, jwtCookie.toString());
        }

        if (payload.getCsrfToken() != null) {
            ResponseCookie csrfCookie = ResponseCookie.from(CookieUtils.CSRF_COOKIE_NAME, payload.getCsrfToken())
                    .httpOnly(false)
                    .secure(false)
                    .path("/")
                    .maxAge((int) jwtTtlSeconds)
                    .sameSite("Lax")
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, csrfCookie.toString());
        }

        return ResponseEntity.ok(ApiResponse.ok(payload));
    }
}