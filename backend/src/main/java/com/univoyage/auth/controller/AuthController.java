package com.univoyage.auth.controller;

import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.dto.RegisterRequestDto;
import com.univoyage.auth.dto.LoginRequestDto;
import com.univoyage.auth.service.AuthService;
import com.univoyage.auth.security.ClientIpResolver;
import com.univoyage.auth.security.CookieUtils;
import com.univoyage.auth.security.LoginIpRateLimiter;
import com.univoyage.common.response.ApiResponse;
import com.univoyage.user.dto.UserDto;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final LoginIpRateLimiter loginIpRateLimiter;

    @Value("${app.jwt.ttl-seconds}")
    private long jwtTtlSeconds;

    @Value("${app.cookies.secure:false}")
    private boolean cookieSecure;

    @Value("${app.cookies.same-site:Lax}")
    private String cookieSameSite;

    @Value("${app.cookies.domain:}")
    private String cookieDomain;

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

        writeAuthCookies(response, payload);
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

            writeAuthCookies(response, payload);
            return ResponseEntity.ok(ApiResponse.ok(payload));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.fail("Invalid email or password"));
        }
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
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletResponse response) {
        ResponseCookie jwt = cookie("", 0, true);
        ResponseCookie csrf = cookie("", 0, false);

        response.addHeader(HttpHeaders.SET_COOKIE, jwt.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, csrf.toString());

        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    private void writeAuthCookies(HttpServletResponse response, AuthPayload payload) {
        if (payload.getToken() != null) {
            ResponseCookie jwt = cookie(payload.getToken(), jwtTtlSeconds, true);
            response.addHeader(HttpHeaders.SET_COOKIE, jwt.toString());
        }
        if (payload.getCsrfToken() != null) {
            ResponseCookie csrf = cookie(payload.getCsrfToken(), jwtTtlSeconds, false);
            response.addHeader(HttpHeaders.SET_COOKIE, csrf.toString());
        }
    }

    private ResponseCookie cookie(String value, long maxAgeSeconds, boolean httpOnly) {
        ResponseCookie.ResponseCookieBuilder b = ResponseCookie
                .from(httpOnly ? CookieUtils.JWT_COOKIE_NAME : CookieUtils.CSRF_COOKIE_NAME, value)
                .httpOnly(httpOnly)
                .secure(cookieSecure)
                .path("/")
                .maxAge(maxAgeSeconds)
                .sameSite(cookieSameSite);

        if (cookieDomain != null && !cookieDomain.isBlank()) {
            b.domain(cookieDomain);
        }

        return b.build();
    }
}
