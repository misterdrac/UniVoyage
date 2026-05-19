package com.univoyage.auth.controller;

import com.univoyage.admin.audit.service.CmsAuditService;
import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.dto.GoogleCallbackRequestDto;
import com.univoyage.auth.oauth.OAuthSecurityProperties;
import com.univoyage.auth.security.AuthCookieWriter;
import com.univoyage.auth.security.ClientIpResolver;
import com.univoyage.auth.security.OAuthCallbackIpRateLimiter;
import com.univoyage.auth.service.AuthSecurityEventLogger;
import com.univoyage.auth.service.AuthSecurityEventLogger.EventType;
import com.univoyage.auth.service.AuthSecurityEventLogger.Result;
import com.univoyage.auth.service.GoogleOAuthService;
import com.univoyage.auth.service.RefreshTokenService;
import com.univoyage.common.response.ApiResponse;
import com.univoyage.user.repository.UserRepository;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller for Google OAuth 2.0: redirect to Google and callback that sets
 * the same auth cookies as password login.
 */
@CrossOrigin(origins = {"http://localhost:5173",
    "http://127.0.0.1:5173"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class GoogleOAuthController {

  private final GoogleOAuthService googleOAuthService;
  private final RefreshTokenService refreshTokenService;
  private final AuthCookieWriter authCookieWriter;
  private final UserRepository userRepository;
  private final OAuthCallbackIpRateLimiter oauthCallbackIpRateLimiter;
  private final OAuthSecurityProperties oauthSecurityProperties;
  private final CmsAuditService cmsAuditService;
  private final AuthSecurityEventLogger securityEventLogger;

  @GetMapping("/google")
  public void googleAuth(HttpServletResponse response) throws IOException {
    String url = googleOAuthService.buildAuthorizationUrl();
    response.sendRedirect(url);
  }

  @PostMapping("/google/callback")
  public ResponseEntity<ApiResponse<AuthPayload>> googleCallback(HttpServletRequest httpRequest,
      @RequestBody GoogleCallbackRequestDto request, HttpServletResponse response) {
    log.debug("Google OAuth callback received");
    String ip = ClientIpResolver.resolve(httpRequest);
    long retryAfterSec = oauthCallbackIpRateLimiter.tryConsumeOrRetryAfterSeconds(ip);
    if (retryAfterSec >= 0) {
      log.warn("Google OAuth callback rate limited");
      securityEventLogger.log(EventType.AUTH_RATE_LIMITED, Result.FAILURE, null, null, ip, "google",
          "oauth-callback");
      return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
          .header(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfterSec)).body(ApiResponse
              .fail("Too many OAuth attempts from this network. Please try again later."));
    }

    if (request.getCode() == null || request.getCode().isBlank()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(ApiResponse.fail("Missing authorization code"));
    }
    if (oauthSecurityProperties.isRequireSignedOAuthState()
        && (request.getState() == null || request.getState().isBlank())) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(ApiResponse.fail("Missing OAuth state"));
    }

    String stateParam = request.getState() != null ? request.getState() : "";
    AuthPayload payload = googleOAuthService.handleCallback(request.getCode(), stateParam);

    if (!payload.isSuccess()) {
      String err = payload.getError() != null ? payload.getError() : "Google login failed";
      securityEventLogger.log(EventType.AUTH_OAUTH_FAILED, Result.FAILURE, null, null, ip, "google",
          err);
      if (GoogleOAuthService.ERROR_INVALID_STATE.equals(err)) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.fail(err));
      }
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.fail(err));
    }

    var user = userRepository.findById(payload.getUser().getId())
        .orElseThrow(() -> new IllegalStateException("User not found after Google auth"));
    String refreshRaw = refreshTokenService.issueRefreshToken(user);
    authCookieWriter.writeAuthCookies(response, payload.getToken(), payload.getCsrfToken(),
        refreshRaw);

    securityEventLogger.log(EventType.AUTH_OAUTH_SUCCESS, Result.SUCCESS, payload.getUser().getId(),
        payload.getUser().getEmail(), ip, "google");

    String role = payload.getUser().getRole();
    if ("ADMIN".equals(role) || "HEAD_ADMIN".equals(role)) {
      cmsAuditService.recordAdminLoginSuccess(payload.getUser().getId(),
          payload.getUser().getEmail(), ip, "google");
    }

    return ResponseEntity.ok(ApiResponse.ok(payload));
  }
}
