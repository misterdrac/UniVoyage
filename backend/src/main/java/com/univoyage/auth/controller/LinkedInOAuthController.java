package com.univoyage.auth.controller;

import com.univoyage.admin.audit.service.CmsAuditService;
import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.dto.OAuthCallbackRequestDto;
import com.univoyage.auth.oauth.OAuthSecurityProperties;
import com.univoyage.auth.security.AuthCookieWriter;
import com.univoyage.auth.security.ClientIpResolver;
import com.univoyage.auth.security.OAuthCallbackIpRateLimiter;
import com.univoyage.auth.service.AuthSecurityEventLogger;
import com.univoyage.auth.service.AuthSecurityEventLogger.EventType;
import com.univoyage.auth.service.AuthSecurityEventLogger.Result;
import com.univoyage.auth.service.LinkedInOAuthService;
import com.univoyage.auth.service.RefreshTokenService;
import com.univoyage.common.response.ApiResponse;
import com.univoyage.user.repository.UserRepository;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@CrossOrigin(origins = {"http://localhost:5173",
    "http://127.0.0.1:5173"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class LinkedInOAuthController {

  private final LinkedInOAuthService linkedInOAuthService;
  private final RefreshTokenService refreshTokenService;
  private final AuthCookieWriter authCookieWriter;
  private final UserRepository userRepository;
  private final OAuthCallbackIpRateLimiter oauthCallbackIpRateLimiter;
  private final OAuthSecurityProperties oauthSecurityProperties;
  private final CmsAuditService cmsAuditService;
  private final AuthSecurityEventLogger securityEventLogger;

  @GetMapping("/linkedin")
  public void linkedInAuth(HttpServletResponse response) throws IOException {
    response.sendRedirect(linkedInOAuthService.buildAuthorizationUrl());
  }

  @PostMapping("/linkedin/callback")
  public ResponseEntity<ApiResponse<AuthPayload>> linkedInCallback(HttpServletRequest httpRequest,
      @RequestBody OAuthCallbackRequestDto request, HttpServletResponse response) {
    log.debug("LinkedIn OAuth callback received");
    String ip = ClientIpResolver.resolve(httpRequest);
    long retryAfterSec = oauthCallbackIpRateLimiter.tryConsumeOrRetryAfterSeconds(ip);
    if (retryAfterSec >= 0) {
      securityEventLogger.log(EventType.AUTH_RATE_LIMITED, Result.FAILURE, null,
          null, ip, "linkedin", "oauth-callback");
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
    AuthPayload payload = linkedInOAuthService.handleCallback(request.getCode(), stateParam);

    if (!payload.isSuccess()) {
      String err = payload.getError() != null ? payload.getError() : "LinkedIn login failed";
      securityEventLogger.log(EventType.AUTH_OAUTH_FAILED, Result.FAILURE, null,
          null, ip, "linkedin", err);
      if (LinkedInOAuthService.ERROR_INVALID_STATE.equals(err)) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.fail(err));
      }
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.fail(err));
    }

    var user = userRepository.findById(payload.getUser().getId())
        .orElseThrow(() -> new IllegalStateException("User not found after LinkedIn auth"));
    String refreshRaw = refreshTokenService.issueRefreshToken(user);
    authCookieWriter.writeAuthCookies(response, payload.getToken(), payload.getCsrfToken(),
        refreshRaw);

    securityEventLogger.log(EventType.AUTH_OAUTH_SUCCESS, Result.SUCCESS,
        payload.getUser().getId(), payload.getUser().getEmail(), ip, "linkedin");

    String role = payload.getUser().getRole();
    if ("ADMIN".equals(role) || "HEAD_ADMIN".equals(role)) {
      cmsAuditService.recordAdminLoginSuccess(payload.getUser().getId(),
          payload.getUser().getEmail(), ip, "linkedin");
    }

    return ResponseEntity.ok(ApiResponse.ok(payload));
  }
}
