package com.univoyage.auth.controller;

import com.univoyage.auth.config.AdminTwoFactorProperties;
import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.dto.RegisterRequestDto;
import com.univoyage.auth.dto.LoginRequestDto;
import com.univoyage.auth.security.AuthCookieWriter;
import com.univoyage.auth.security.JwtAuthenticationFilter;
import com.univoyage.auth.security.JwtService;
import com.univoyage.auth.service.AuthSecurityEventLogger;
import com.univoyage.auth.service.AuthSecurityEventLogger.EventType;
import com.univoyage.auth.service.AuthSecurityEventLogger.Result;
import com.univoyage.auth.service.AuthService;
import com.univoyage.auth.service.RefreshTokenService;
import com.univoyage.auth.security.ClientIpResolver;
import com.univoyage.auth.security.CookieUtils;
import com.univoyage.auth.security.LoginIpRateLimiter;
import com.univoyage.auth.security.RefreshIpRateLimiter;
import com.univoyage.common.response.ApiResponse;
import com.univoyage.admin.audit.service.CmsAuditService;
import com.univoyage.user.dto.UserDto;
import com.univoyage.user.model.Role;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
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
@Log4j2
public class AuthController {

  private final AuthService authService;
  private final UserRepository userRepository;
  private final LoginIpRateLimiter loginIpRateLimiter;
  private final RefreshIpRateLimiter refreshIpRateLimiter;
  private final RefreshTokenService refreshTokenService;
  private final AdminTwoFactorProperties adminTwoFactorProperties;
  private final JwtService jwtService;
  private final AuthCookieWriter authCookieWriter;
  private final CmsAuditService cmsAuditService;
  private final AuthSecurityEventLogger securityEventLogger;

  @PostMapping("/register")
  public ResponseEntity<ApiResponse<AuthPayload>> register(
      @Valid @RequestBody RegisterRequestDto request, HttpServletResponse response) {
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
  public ResponseEntity<ApiResponse<AuthPayload>> login(@Valid @RequestBody LoginRequestDto request,
      HttpServletRequest httpRequest, HttpServletResponse response) {
    String ip = ClientIpResolver.resolve(httpRequest);
    long retryAfterSec = loginIpRateLimiter.tryConsumeOrRetryAfterSeconds(ip);
    if (retryAfterSec >= 0) {
      log.warn("Login rate limited (too many attempts from client network)");
      securityEventLogger.log(EventType.AUTH_RATE_LIMITED, Result.FAILURE, null, request.getEmail(),
          ip, "password", "login");
      return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
          .header(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfterSec)).body(ApiResponse
              .fail("Too many login attempts from this network. Please try again later."));
    }
    try {
      AuthPayload payload = authService.login(request);

      if (!payload.isSuccess()) {
        log.info("Login failed: invalid credentials");
        securityEventLogger.log(EventType.AUTH_LOGIN_FAILED, Result.FAILURE, null,
            request.getEmail(), ip, "password");
        recordAdminLoginFailureIfApplicable(request.getEmail(), httpRequest);
        String msg = (payload.getError() != null && !payload.getError().isBlank())
            ? payload.getError()
            : "Invalid email or password";
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.fail(msg));
      }

      issueRefreshAndWriteCookies(response, payload);
      log.debug("Login succeeded userId={}", payload.getUser().getId());
      securityEventLogger.log(EventType.AUTH_LOGIN_SUCCESS, Result.SUCCESS,
          payload.getUser().getId(), request.getEmail(), ip, "password");
      maybeRecordAdminPasswordLogin(payload, httpRequest);
      return ResponseEntity.ok(ApiResponse.ok(payload));

    } catch (IllegalArgumentException e) {
      log.info("Login failed: invalid credentials");
      securityEventLogger.log(EventType.AUTH_LOGIN_FAILED, Result.FAILURE, null, request.getEmail(),
          ip, "password");
      recordAdminLoginFailureIfApplicable(request.getEmail(), httpRequest);
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(ApiResponse.fail("Invalid email or password"));
    }
  }

  /**
   * Exchanges a valid refresh token (HttpOnly cookie) for a new access JWT, CSRF
   * cookie, and rotated refresh token.
   */
  @PostMapping("/refresh")
  public ResponseEntity<ApiResponse<AuthPayload>> refresh(HttpServletRequest request,
      HttpServletResponse response) {
    long refreshRetrySec = refreshIpRateLimiter
        .tryConsumeOrRetryAfterSeconds(ClientIpResolver.resolve(request));
    if (refreshRetrySec >= 0) {
      log.warn("Refresh token rate limited (too many attempts from client network)");
      return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
          .header(HttpHeaders.RETRY_AFTER, String.valueOf(refreshRetrySec)).body(ApiResponse
              .fail("Too many refresh attempts from this network. Please try again later."));
    }

    Cookie cookie = WebUtils.getCookie(request, CookieUtils.REFRESH_TOKEN_COOKIE_NAME);
    String raw = cookie != null ? cookie.getValue() : null;
    Cookie jwtCookie = WebUtils.getCookie(request, CookieUtils.JWT_COOKIE_NAME);
    String jwtValue = jwtCookie != null ? jwtCookie.getValue() : null;
    boolean preserveTwoFactor = jwtService.extractTwoFactorVerifiedAllowExpired(jwtValue);
    Optional<RefreshTokenService.RefreshRotationResult> result = refreshTokenService.rotate(raw,
        preserveTwoFactor);
    if (result.isEmpty()) {
      log.info("Refresh rejected: missing or invalid session");
      authCookieWriter.clearAuthCookies(response);
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(ApiResponse.fail("Session expired or invalid"));
    }
    RefreshTokenService.RefreshRotationResult r = result.get();
    authCookieWriter.writeAuthCookies(response, r.payload().getToken(), r.payload().getCsrfToken(),
        r.newRefreshTokenRaw());
    return ResponseEntity.ok(ApiResponse.ok(r.payload()));
  }

  @GetMapping("/me")
  @Transactional(readOnly = true)
  public ResponseEntity<ApiResponse<UserDto>> me(HttpServletRequest request) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null || !authentication.isAuthenticated()) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(ApiResponse.fail("Not authenticated"));
    }

    Object principal = authentication.getPrincipal();
    if (!(principal instanceof UserEntity)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(ApiResponse.fail("Invalid authentication"));
    }

    UserEntity userEntity = (UserEntity) principal;

    UserEntity loadedUser = userRepository.findById(userEntity.getId())
        .orElseThrow(() -> new RuntimeException("User not found: " + userEntity.getId()));

    if (loadedUser.getCountry() != null)
      loadedUser.getCountry().getCountryName();
    loadedUser.getUserHobbies().size();
    loadedUser.getUserLanguages().size();
    loadedUser.getVisitedCountries().size();

    UserDto dto = UserDto.from(loadedUser);
    boolean isAdmin = loadedUser.getRole() == Role.ADMIN || loadedUser.getRole() == Role.HEAD_ADMIN;
    boolean tfaVerified = isAdmin && (!adminTwoFactorProperties.isEnabled() || Boolean.TRUE
        .equals(request.getAttribute(JwtAuthenticationFilter.TFA_REQUEST_ATTRIBUTE)));
    dto.setTwoFactorVerified(tfaVerified);

    return ResponseEntity.ok(ApiResponse.ok(dto));
  }

  @PostMapping("/logout")
  public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request,
      HttpServletResponse response) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication != null && authentication.getPrincipal() instanceof UserEntity u) {
      if (u.getRole() == Role.ADMIN || u.getRole() == Role.HEAD_ADMIN) {
        cmsAuditService.recordAdminLogout(u.getId(), u.getEmail(),
            ClientIpResolver.resolve(request));
      }
      securityEventLogger.log(EventType.AUTH_LOGOUT, Result.SUCCESS, u.getId(), u.getEmail(),
          ClientIpResolver.resolve(request), "session");
      refreshTokenService.revokeAllForUser(u.getId());
    }
    Cookie refreshCookie = WebUtils.getCookie(request, CookieUtils.REFRESH_TOKEN_COOKIE_NAME);
    if (refreshCookie != null) {
      refreshTokenService.revokeByRawToken(refreshCookie.getValue());
    }
    authCookieWriter.clearAuthCookies(response);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  private void maybeRecordAdminPasswordLogin(AuthPayload payload, HttpServletRequest httpRequest) {
    UserDto u = payload.getUser();
    if (u == null || u.getRole() == null) {
      return;
    }
    if (!"ADMIN".equals(u.getRole()) && !"HEAD_ADMIN".equals(u.getRole())) {
      return;
    }
    cmsAuditService.recordAdminLoginSuccess(u.getId(), u.getEmail(),
        ClientIpResolver.resolve(httpRequest), "password");
  }

  private void recordAdminLoginFailureIfApplicable(String email, HttpServletRequest httpRequest) {
    if (email == null || email.isBlank()) {
      return;
    }
    userRepository.findByEmail(email).ifPresent(user -> {
      if (user.getRole() == Role.ADMIN || user.getRole() == Role.HEAD_ADMIN) {
        cmsAuditService.recordAdminLoginFailed(user.getEmail(),
            ClientIpResolver.resolve(httpRequest));
      }
    });
  }

  private void issueRefreshAndWriteCookies(HttpServletResponse response, AuthPayload payload) {
    UserEntity user = userRepository.findById(payload.getUser().getId()).orElseThrow(
        () -> new IllegalStateException("User not found after auth: " + payload.getUser().getId()));
    String refreshRaw = refreshTokenService.issueRefreshToken(user);
    authCookieWriter.writeAuthCookies(response, payload.getToken(), payload.getCsrfToken(),
        refreshRaw);
  }
}
