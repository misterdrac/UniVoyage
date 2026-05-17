package com.univoyage.auth.controller;

import com.univoyage.auth.dto.PasswordForgotAcceptedResponseDto;
import com.univoyage.auth.dto.PasswordForgotRequestDto;
import com.univoyage.auth.dto.PasswordResetRequestDto;
import com.univoyage.auth.security.ClientIpResolver;
import com.univoyage.auth.security.PasswordResetForgotEmailRateLimiter;
import com.univoyage.auth.security.PasswordResetForgotIpRateLimiter;
import com.univoyage.auth.security.PasswordResetSubmitIpRateLimiter;
import com.univoyage.auth.service.PasswordResetService;
import com.univoyage.auth.service.PasswordResetService.ResetOutcome;
import com.univoyage.common.response.ApiResponse;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth/password")
@RequiredArgsConstructor
public class PasswordResetController {

  private static final String RATE_LIMIT_MSG = "Too many attempts. Please try again later.";
  private static final String RESET_FAIL_MSG = "Invalid or expired reset link. Please request a new password reset.";

  private final PasswordResetService passwordResetService;
  private final PasswordResetForgotIpRateLimiter forgotIpRateLimiter;
  private final PasswordResetForgotEmailRateLimiter forgotEmailRateLimiter;
  private final PasswordResetSubmitIpRateLimiter resetIpRateLimiter;

  @PostMapping("/forgot")
  public ResponseEntity<ApiResponse<PasswordForgotAcceptedResponseDto>> forgot(
      @Valid @RequestBody PasswordForgotRequestDto body, HttpServletRequest httpRequest) {
    String ip = ClientIpResolver.resolve(httpRequest);
    long ipRetry = forgotIpRateLimiter.tryConsumeOrRetryAfterSeconds(ip);
    if (ipRetry >= 0) {
      return rateLimited(ipRetry);
    }

    String email = PasswordResetService.normalizeEmail(body.getEmail());
    long emailRetry = forgotEmailRateLimiter.tryConsumeOrRetryAfterSeconds(email);
    if (emailRetry >= 0) {
      return rateLimited(emailRetry);
    }

    passwordResetService.requestForgot(email);
    return ResponseEntity.ok(ApiResponse.ok(PasswordForgotAcceptedResponseDto.standard()));
  }

  @PostMapping("/reset")
  public ResponseEntity<ApiResponse<Void>> reset(@Valid @RequestBody PasswordResetRequestDto body,
      HttpServletRequest httpRequest) {
    String ip = ClientIpResolver.resolve(httpRequest);
    long ipRetry = resetIpRateLimiter.tryConsumeOrRetryAfterSeconds(ip);
    if (ipRetry >= 0) {
      return resetRateLimited(ipRetry);
    }

    ResetOutcome outcome = passwordResetService.resetPassword(body.getToken(),
        body.getNewPassword());
    if (outcome == ResetOutcome.SUCCESS) {
      return ResponseEntity.ok(ApiResponse.ok(null));
    }
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.fail(RESET_FAIL_MSG));
  }

  private ResponseEntity<ApiResponse<PasswordForgotAcceptedResponseDto>> rateLimited(
      long retryAfterSec) {
    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
        .header(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfterSec))
        .body(ApiResponse.fail(RATE_LIMIT_MSG));
  }

  private ResponseEntity<ApiResponse<Void>> resetRateLimited(long retryAfterSec) {
    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
        .header(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfterSec))
        .body(ApiResponse.fail(RATE_LIMIT_MSG));
  }
}
