package com.univoyage.auth;

import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.dto.RegisterRequestDto;
import com.univoyage.auth.dto.LoginRequestDto;
import com.univoyage.auth.user.UserEntity;
import com.univoyage.auth.user.UserRepository;
import com.univoyage.auth.user.dto.UserDto;
import com.univoyage.common.ApiResponse;
import com.univoyage.security.CookieUtils;
import java.io.IOException;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

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
    private final GoogleOAuthService googleOAuthService;

    @Value("${app.jwt.ttl-seconds}")
    private long jwtTtlSeconds;

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthPayload>> register(
            @Valid @RequestBody RegisterRequestDto request,
            HttpServletResponse response
    ) {
        AuthPayload payload = authService.register(request);

        if (!payload.isSuccess()) {
            // ovdje ne znamo koje sve fieldove ima AuthPayload,
            // pa šaljemo generičku poruku
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail("Registration failed"));
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

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthPayload>> login(
            @RequestBody LoginRequestDto request,
            HttpServletResponse response
    ) {
        AuthPayload payload = authService.login(request);

        if (!payload.isSuccess()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.fail("Invalid email or password"));
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
    }

    // GET /api/auth/me
    // vrati trenutno autentificiranog usera, *zamotanog* u ApiResponse
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

    // POST /api/auth/logout
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
