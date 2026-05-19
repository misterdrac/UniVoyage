package com.univoyage.auth.controller;

import com.univoyage.auth.security.Admin2faChallengeEmailRateLimiter;
import com.univoyage.auth.security.Admin2faChallengeIpRateLimiter;
import com.univoyage.auth.security.Admin2faVerifyEmailRateLimiter;
import com.univoyage.auth.security.Admin2faVerifyIpRateLimiter;
import com.univoyage.auth.security.AuthCookieWriter;
import com.univoyage.auth.security.ClientIpResolver;
import com.univoyage.auth.service.AdminTwoFactorService;
import com.univoyage.auth.service.AdminTwoFactorService.Admin2faVerifyResult;
import com.univoyage.common.response.ApiResponse;
import com.univoyage.user.model.UserEntity;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/2fa")
@RequiredArgsConstructor
@Log4j2
public class AdminTwoFactorController {

  private static final String RATE_LIMIT_MSG = "Too many attempts. Please try again later.";

  private final AdminTwoFactorService adminTwoFactorService;
  private final Admin2faChallengeIpRateLimiter challengeIpLimiter;
  private final Admin2faChallengeEmailRateLimiter challengeEmailLimiter;
  private final Admin2faVerifyIpRateLimiter verifyIpLimiter;
  private final Admin2faVerifyEmailRateLimiter verifyEmailLimiter;
  private final AuthCookieWriter authCookieWriter;

  @PostMapping("/challenge")
  public ResponseEntity<ApiResponse<Map<String, String>>> challenge(
      @AuthenticationPrincipal UserEntity user, HttpServletRequest httpRequest) {

    if (user == null || !adminTwoFactorService.isAdminRole(user)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(ApiResponse.fail("Admin access required."));
    }

    String ip = ClientIpResolver.resolve(httpRequest);
    long ipRetry = challengeIpLimiter.tryConsumeOrRetryAfterSeconds(ip);
    if (ipRetry >= 0) {
      return challengeRateLimited(ipRetry);
    }

    String email = user.getEmail().toLowerCase();
    long emailRetry = challengeEmailLimiter.tryConsumeOrRetryAfterSeconds(email);
    if (emailRetry >= 0) {
      return challengeRateLimited(emailRetry);
    }

    adminTwoFactorService.challenge(user);

    return ResponseEntity.ok(ApiResponse.ok(
        Map.of("message", "Verification code sent to your email.")));
  }

  @PostMapping("/verify")
  public ResponseEntity<ApiResponse<Map<String, String>>> verify(
      @AuthenticationPrincipal UserEntity user,
      @RequestBody Map<String, String> body,
      HttpServletRequest httpRequest, HttpServletResponse httpResponse) {

    if (user == null || !adminTwoFactorService.isAdminRole(user)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(ApiResponse.fail("Admin access required."));
    }

    String ip = ClientIpResolver.resolve(httpRequest);
    long ipRetry = verifyIpLimiter.tryConsumeOrRetryAfterSeconds(ip);
    if (ipRetry >= 0) {
      return verifyRateLimited(ipRetry);
    }

    String email = user.getEmail().toLowerCase();
    long emailRetry = verifyEmailLimiter.tryConsumeOrRetryAfterSeconds(email);
    if (emailRetry >= 0) {
      return verifyRateLimited(emailRetry);
    }

    String code = body.get("code");
    if (code == null || code.isBlank()) {
      return ResponseEntity.badRequest().body(ApiResponse.fail("Code is required."));
    }

    Admin2faVerifyResult result = adminTwoFactorService.verify(user, code, ip);

    if (result.success()) {
      authCookieWriter.writeAuthCookies(httpResponse, result.tokenPair().jwt(),
          result.tokenPair().csrfSecret(), null);
      return ResponseEntity.ok(ApiResponse.ok(
          Map.of("message", "Two-factor authentication verified.")));
    }

    if (result.retryAfterSeconds() > 0) {
      return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
          .header(HttpHeaders.RETRY_AFTER, String.valueOf(result.retryAfterSeconds()))
          .body(ApiResponse.fail(result.errorMessage()));
    }

    return ResponseEntity.badRequest().body(ApiResponse.fail(result.errorMessage()));
  }

  private ResponseEntity<ApiResponse<Map<String, String>>> challengeRateLimited(long retryAfter) {
    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
        .header(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfter))
        .body(ApiResponse.fail(RATE_LIMIT_MSG));
  }

  private ResponseEntity<ApiResponse<Map<String, String>>> verifyRateLimited(long retryAfter) {
    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
        .header(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfter))
        .body(ApiResponse.fail(RATE_LIMIT_MSG));
  }
}
