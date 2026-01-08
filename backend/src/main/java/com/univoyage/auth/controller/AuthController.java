package com.univoyage.auth.controller;

import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.dto.RegisterRequestDto;
import com.univoyage.auth.dto.LoginRequestDto;
import com.univoyage.auth.service.AuthService;
import com.univoyage.auth.security.CookieUtils;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.dto.UserDto;
import com.univoyage.user.repository.UserRepository;
import com.univoyage.common.response.ApiResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;


/**
 * Controller for authentication-related endpoints.
 * Provides endpoints for user registration, login, logout, and fetching current user info.
 * All endpoints are prefixed with /api/auth.
 * Uses AuthService for business logic.
 * Returns responses wrapped in ApiResponse for consistent API structure.
 * Manages JWT and CSRF tokens via HttpOnly and readable cookies.
 * Handles setting and deleting cookies in the HTTP response.
 * Supports CORS for frontend applications running on localhost:5173.
 * Validates request bodies for registration and login.
 */
@CrossOrigin(
        origins = {"http://localhost:5173","http://127.0.0.1:5173"},
        allowCredentials = "true"
)
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @Value("${app.jwt.ttl-seconds}")
    private long jwtTtlSeconds;

    /**
     * POST /api/auth/register
     * @param request
     * @param response
     * @return ResponseEntity<ApiResponse<AuthPayload>>
     *    Registers a new user and sets JWT and CSRF cookies in the response.
     *    On success, returns 201 Created with AuthPayload containing tokens.
     *    On failure, returns 400 Bad Request with error message.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthPayload>> register(
            @Valid @RequestBody RegisterRequestDto request,
            HttpServletResponse response
    ) {
        AuthPayload payload = authService.register(request);

        if (!payload.isSuccess()) {
            // Use the actual error message from AuthPayload if available, otherwise use generic message
            String errorMessage = payload.getError() != null && !payload.getError().isBlank() 
                    ? payload.getError() 
                    : "Registration failed";
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail(errorMessage));
        }

        // Set HttpOnly cookie for JWT using ResponseCookie (supports SameSite)
        if (payload.getToken() != null) {
            ResponseCookie jwtCookie = ResponseCookie.from(CookieUtils.JWT_COOKIE_NAME, payload.getToken())
                    .httpOnly(true)
                    .secure(false) // false for localhost, true in production with HTTPS
                    .path("/")
                    .maxAge((int) jwtTtlSeconds)
                    .sameSite("Lax") // Lax works better for localhost, allows cookies on top-level navigation (refresh)
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, jwtCookie.toString());
        }

        // Set readable cookie for CSRF token using ResponseCookie
        if (payload.getCsrfToken() != null) {
            ResponseCookie csrfCookie = ResponseCookie.from(CookieUtils.CSRF_COOKIE_NAME, payload.getCsrfToken())
                    .httpOnly(false) // must be readable by frontend
                    .secure(false) // false for localhost, true in production with HTTPS
                    .path("/")
                    .maxAge((int) jwtTtlSeconds)
                    .sameSite("Lax") // Lax works better for localhost, allows cookies on top-level navigation (refresh)
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, csrfCookie.toString());
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(payload));
    }

    /**
     * POST /api/auth/login
     * @param request
     * @param response
     * @return ResponseEntity<ApiResponse<AuthPayload>>
     *    Authenticates a user and sets JWT and CSRF cookies in the response.
     *    On success, returns 200 OK with AuthPayload containing tokens.
     *    On failure, returns 401 Unauthorized with error message.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthPayload>> login(
            @RequestBody LoginRequestDto request,
            HttpServletResponse response
    ) {
        try {
            AuthPayload payload = authService.login(request);

            if (!payload.isSuccess()) {
                // Use the actual error message from AuthPayload if available, otherwise use generic message
                String errorMessage = payload.getError() != null && !payload.getError().isBlank() 
                        ? payload.getError() 
                        : "Invalid email or password";
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.fail(errorMessage));
            }

            // Set HttpOnly cookie for JWT using ResponseCookie (supports SameSite)
            if (payload.getToken() != null) {
                ResponseCookie jwtCookie = ResponseCookie.from(CookieUtils.JWT_COOKIE_NAME, payload.getToken())
                        .httpOnly(true)
                        .secure(false) // false for localhost, true in production with HTTPS
                        .path("/")
                        .maxAge((int) jwtTtlSeconds)
                        .sameSite("Lax") // Lax works better for localhost, allows cookies on top-level navigation (refresh)
                        .build();
                response.addHeader(HttpHeaders.SET_COOKIE, jwtCookie.toString());
            }

            // Set readable cookie for CSRF token using ResponseCookie
            if (payload.getCsrfToken() != null) {
                ResponseCookie csrfCookie = ResponseCookie.from(CookieUtils.CSRF_COOKIE_NAME, payload.getCsrfToken())
                        .httpOnly(false) // must be readable by frontend
                        .secure(false) // false for localhost, true in production with HTTPS
                        .path("/")
                        .maxAge((int) jwtTtlSeconds)
                        .sameSite("Lax") // Lax works better for localhost, allows cookies on top-level navigation (refresh)
                        .build();
                response.addHeader(HttpHeaders.SET_COOKIE, csrfCookie.toString());
            }

            return ResponseEntity.ok(ApiResponse.ok(payload));
        } catch (IllegalArgumentException e) {
            // Handle IllegalArgumentException (e.g., user not found)
            // Return user-friendly error message instead of exposing internal error
            String errorMessage = "Invalid email or password";
            if (e.getMessage() != null && e.getMessage().contains("Invalid credentials")) {
                errorMessage = "Invalid email or password";
            }
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.fail(errorMessage));
        }
    }

    /**
     * GET /api/auth/me
     * @return ResponseEntity<ApiResponse<UserDto>>
     *     Retrieves the currently authenticated user's information.
     *     On success, returns 200 OK with UserDto.
     *     On failure, returns 401 Unauthorized if not authenticated.
     */
    @GetMapping("/me")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<UserDto>> me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.fail("Not authenticated"));
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserEntity)) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.fail("Invalid authentication"));
        }

        UserEntity userEntity = (UserEntity) principal;
        
        // Reload user with all relationships to avoid LazyInitializationException
        // The entity from SecurityContext might be detached, so we reload it
        UserEntity loadedUser = userRepository.findById(userEntity.getId())
                .orElseThrow(() -> new RuntimeException("User not found: " + userEntity.getId()));
        
        // Force initialization of lazy relationships by accessing them
        if (loadedUser.getCountry() != null) {
            loadedUser.getCountry().getCountryName();
        }
        loadedUser.getUserHobbies().size();
        loadedUser.getUserLanguages().size();
        loadedUser.getVisitedCountries().size();
        
        UserDto userDto = UserDto.from(loadedUser);
        return ResponseEntity.ok(ApiResponse.ok(userDto));
    }

    /**
     * POST /api/auth/logout
     * @param response
     * @return ResponseEntity<ApiResponse<Void>>
     *    Logs out the user by deleting JWT and CSRF cookies.
     *    On success, returns 200 OK.
     *    On failure, returns appropriate error status.
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletResponse response) {
        // Delete JWT cookie by setting it with maxAge(0) and empty value
        ResponseCookie jwtCookie = ResponseCookie.from(CookieUtils.JWT_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(false) // false for localhost, true in production with HTTPS
                .path("/")
                .maxAge(0) // Delete cookie immediately
                .sameSite("Lax") // Must match the SameSite used when setting the cookie
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, jwtCookie.toString());

        // Delete CSRF cookie by setting it with maxAge(0) and empty value
        ResponseCookie csrfCookie = ResponseCookie.from(CookieUtils.CSRF_COOKIE_NAME, "")
                .httpOnly(false) // must be readable by frontend
                .secure(false) // false for localhost, true in production with HTTPS
                .path("/")
                .maxAge(0) // Delete cookie immediately
                .sameSite("Lax") // Must match the SameSite used when setting the cookie
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, csrfCookie.toString());

        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
