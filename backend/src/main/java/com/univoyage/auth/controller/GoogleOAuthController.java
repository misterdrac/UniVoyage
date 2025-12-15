package com.univoyage.auth.controller;

import com.univoyage.auth.dto.GoogleCallbackRequestDto;
import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.common.ApiResponse;
import com.univoyage.security.CookieUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/** * Controller for handling Google OAuth 2.0 authentication.
 */
@CrossOrigin(
        origins = {"http://localhost:5173","http://127.0.0.1:5173"},
        allowCredentials = "true"
)
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
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
        System.out.println(">>> GoogleOAuthController /google/callback HIT");
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