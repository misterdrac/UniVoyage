package com.univoyage.auth.controller;

import com.univoyage.auth.dto.EmailVerificationAcceptedResponseDto;
import com.univoyage.auth.dto.EmailVerificationConfirmDto;
import com.univoyage.auth.dto.EmailVerificationRequestDto;
import com.univoyage.auth.security.ClientIpResolver;
import com.univoyage.auth.security.EmailVerificationConfirmIpRateLimiter;
import com.univoyage.auth.security.EmailVerificationRequestEmailRateLimiter;
import com.univoyage.auth.security.EmailVerificationRequestIpRateLimiter;
import com.univoyage.auth.service.EmailVerificationService;
import com.univoyage.auth.service.EmailVerificationService.ConfirmOutcome;
import com.univoyage.auth.service.PasswordResetService;
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
@RequestMapping("/api/auth/email")
@RequiredArgsConstructor
public class EmailVerificationController {

  private static final String RATE_LIMIT_MSG = "Too many attempts. Please try again later.";
  private static final String CONFIRM_FAIL_MSG = "Invalid or expired verification link. Please request a new verification email.";

  private final EmailVerificationService emailVerificationService;
  private final EmailVerificationRequestIpRateLimiter requestIpRateLimiter;
  private final EmailVerificationRequestEmailRateLimiter requestEmailRateLimiter;
  private final EmailVerificationConfirmIpRateLimiter confirmIpRateLimiter;

  @PostMapping("/verification/request")
  public ResponseEntity<ApiResponse<EmailVerificationAcceptedResponseDto>> request(
      @Valid @RequestBody EmailVerificationRequestDto body, HttpServletRequest httpRequest) {
    String ip = ClientIpResolver.resolve(httpRequest);
    long ipRetry = requestIpRateLimiter.tryConsumeOrRetryAfterSeconds(ip);
    if (ipRetry >= 0) {
      return rateLimited(ipRetry);
    }

    String email = PasswordResetService.normalizeEmail(body.getEmail());
    long emailRetry = requestEmailRateLimiter.tryConsumeOrRetryAfterSeconds(email);
    if (emailRetry >= 0) {
      return rateLimited(emailRetry);
    }

    emailVerificationService.requestVerification(email);
    return ResponseEntity.ok(ApiResponse.ok(EmailVerificationAcceptedResponseDto.standard()));
  }

  @PostMapping("/verification/confirm")
  public ResponseEntity<ApiResponse<Void>> confirm(
      @Valid @RequestBody EmailVerificationConfirmDto body, HttpServletRequest httpRequest) {
    String ip = ClientIpResolver.resolve(httpRequest);
    long ipRetry = confirmIpRateLimiter.tryConsumeOrRetryAfterSeconds(ip);
    if (ipRetry >= 0) {
      return confirmRateLimited(ipRetry);
    }

    ConfirmOutcome outcome = emailVerificationService.confirm(body.getToken());
    if (outcome == ConfirmOutcome.SUCCESS) {
      return ResponseEntity.ok(ApiResponse.ok(null));
    }
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.fail(CONFIRM_FAIL_MSG));
  }

  private ResponseEntity<ApiResponse<EmailVerificationAcceptedResponseDto>> rateLimited(
      long retryAfterSec) {
    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
        .header(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfterSec))
        .body(ApiResponse.fail(RATE_LIMIT_MSG));
  }

  private ResponseEntity<ApiResponse<Void>> confirmRateLimited(long retryAfterSec) {
    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
        .header(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfterSec))
        .body(ApiResponse.fail(RATE_LIMIT_MSG));
  }
}
