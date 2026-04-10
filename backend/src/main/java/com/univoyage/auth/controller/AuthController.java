package com.univoyage.auth.controller;

import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.dto.RegisterRequestDto;
import com.univoyage.auth.dto.LoginRequestDto;
import com.univoyage.auth.security.AuthCookieWriter;
import com.univoyage.auth.service.AuthService;
import com.univoyage.auth.service.RefreshTokenService;
import com.univoyage.auth.security.ClientIpResolver;
import com.univoyage.auth.security.CookieUtils;
import com.univoyage.auth.security.LoginIpRateLimiter;
import com.univoyage.auth.security.RefreshIpRateLimiter;
import com.univoyage.common.response.ApiResponse;
import com.univoyage.user.dto.UserDto;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.WebUtils;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final LoginIpRateLimiter loginIpRateLimiter;
    private final RefreshIpRateLimiter refreshIpRateLimiter;
    private final RefreshTokenService refreshTokenService;
    private final AuthCookieWriter authCookieWriter;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthPayload>> register(
            @Valid @RequestBody RegisterRequestDto request,
            HttpServletResponse response
    ) {
        AuthPayload payload = authService.register(request);

        if (!payload.isSuccess()) {
            String msg = (payload.getError() != null && !payload.getError().isBlank())
                    ? payload.getError()
                    : "Registration failed";
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.fail(msg));
        }

        issueRefreshAndWriteCookies(response, payload);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(payload));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthPayload>> login(
            @Valid @RequestBody LoginRequestDto request,
            HttpServletRequest httpRequest,
            HttpServletResponse response
    ) {
        long retryAfterSec = loginIpRateLimiter.tryConsumeOrRetryAfterSeconds(
                ClientIpResolver.resolve(httpRequest));
        if (retryAfterSec >= 0) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfterSec))
                    .body(ApiResponse.fail("Too many login attempts from this network. Please try again later."));
        }
        try {
            AuthPayload payload = authService.login(request);

            if (!payload.isSuccess()) {
                String msg = (payload.getError() != null && !payload.getError().isBlank())
                        ? payload.getError()
                        : "Invalid email or password";
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.fail(msg));
            }

            issueRefreshAndWriteCookies(response, payload);
            return ResponseEntity.ok(ApiResponse.ok(payload));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.fail("Invalid email or password"));
        }
    }

    /**
     * Exchanges a valid refresh token (HttpOnly cookie) for a new access JWT, CSRF cookie, and rotated refresh token.
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthPayload>> refresh(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        long refreshRetrySec = refreshIpRateLimiter.tryConsumeOrRetryAfterSeconds(
                ClientIpResolver.resolve(request));
        if (refreshRetrySec >= 0) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header(HttpHeaders.RETRY_AFTER, String.valueOf(refreshRetrySec))
                    .body(ApiResponse.fail("Too many refresh attempts from this network. Please try again later."));
        }

        Cookie cookie = WebUtils.getCookie(request, CookieUtils.REFRESH_TOKEN_COOKIE_NAME);
        String raw = cookie != null ? cookie.getValue() : null;
        Optional<RefreshTokenService.RefreshRotationResult> result = refreshTokenService.rotate(raw);
        if (result.isEmpty()) {
            authCookieWriter.clearAuthCookies(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.fail("Session expired or invalid"));
        }
        RefreshTokenService.RefreshRotationResult r = result.get();
        authCookieWriter.writeAuthCookies(
                response,
                r.payload().getToken(),
                r.payload().getCsrfToken(),
                r.newRefreshTokenRaw());
        return ResponseEntity.ok(ApiResponse.ok(r.payload()));
    }

    @GetMapping("/me")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<UserDto>> me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.fail("Not authenticated"));
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserEntity)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.fail("Invalid authentication"));
        }

        UserEntity userEntity = (UserEntity) principal;

        UserEntity loadedUser = userRepository.findById(userEntity.getId())
                .orElseThrow(() -> new RuntimeException("User not found: " + userEntity.getId()));

        if (loadedUser.getCountry() != null) loadedUser.getCountry().getCountryName();
        loadedUser.getUserHobbies().size();
        loadedUser.getUserLanguages().size();
        loadedUser.getVisitedCountries().size();

        return ResponseEntity.ok(ApiResponse.ok(UserDto.from(loadedUser)));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request, HttpServletResponse response) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserEntity u) {
            refreshTokenService.revokeAllForUser(u.getId());
        }
        Cookie refreshCookie = WebUtils.getCookie(request, CookieUtils.REFRESH_TOKEN_COOKIE_NAME);
        if (refreshCookie != null) {
            refreshTokenService.revokeByRawToken(refreshCookie.getValue());
        }
        authCookieWriter.clearAuthCookies(response);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    private void issueRefreshAndWriteCookies(HttpServletResponse response, AuthPayload payload) {
        UserEntity user = userRepository.findById(payload.getUser().getId())
                .orElseThrow(() -> new IllegalStateException("User not found after auth: " + payload.getUser().getId()));
        String refreshRaw = refreshTokenService.issueRefreshToken(user);
        authCookieWriter.writeAuthCookies(response, payload.getToken(), payload.getCsrfToken(), refreshRaw);
    }
}
