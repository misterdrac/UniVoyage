package com.univoyage.auth.controller;

import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.dto.OtpAcceptedResponseDto;
import com.univoyage.auth.dto.OtpRequestDto;
import com.univoyage.auth.dto.OtpVerifyDto;
import com.univoyage.auth.otp.OtpRequestOutcome;
import com.univoyage.auth.otp.OtpVerifyOutcome;
import com.univoyage.auth.security.AuthCookieWriter;
import com.univoyage.auth.security.ClientIpResolver;
import com.univoyage.auth.security.OtpRequestEmailRateLimiter;
import com.univoyage.auth.security.OtpRequestIpRateLimiter;
import com.univoyage.auth.security.OtpVerifyEmailRateLimiter;
import com.univoyage.auth.security.OtpVerifyIpRateLimiter;
import com.univoyage.auth.service.AuthSecurityEventLogger;
import com.univoyage.auth.service.AuthSecurityEventLogger.EventType;
import com.univoyage.auth.service.AuthSecurityEventLogger.Result;
import com.univoyage.auth.service.EmailOtpChallengeService;
import com.univoyage.auth.service.RefreshTokenService;
import com.univoyage.common.response.ApiResponse;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequestMapping("/api/auth/otp")
@RequiredArgsConstructor
@Log4j2
public class EmailOtpController {

  private static final String RATE_LIMIT_MSG = "Too many attempts. Please try again later.";
  private static final String VERIFY_FAIL_MSG = "Invalid or expired verification code.";

  private final EmailOtpChallengeService otpService;
  private final OtpRequestIpRateLimiter requestIpRateLimiter;
  private final OtpRequestEmailRateLimiter requestEmailRateLimiter;
  private final OtpVerifyIpRateLimiter verifyIpRateLimiter;
  private final OtpVerifyEmailRateLimiter verifyEmailRateLimiter;
  private final RefreshTokenService refreshTokenService;
  private final AuthCookieWriter authCookieWriter;
  private final UserRepository userRepository;
  private final AuthSecurityEventLogger securityEventLogger;

  @PostMapping("/request")
  public ResponseEntity<ApiResponse<OtpAcceptedResponseDto>> request(
      @Valid @RequestBody OtpRequestDto body, HttpServletRequest httpRequest) {
    String ip = ClientIpResolver.resolve(httpRequest);
    long ipRetry = requestIpRateLimiter.tryConsumeOrRetryAfterSeconds(ip);
    if (ipRetry >= 0) {
      securityEventLogger.log(EventType.AUTH_RATE_LIMITED, Result.FAILURE, null,
          body.getEmail(), ip, "otp", "otp-request");
      return rateLimited(ipRetry);
    }

    String email = EmailOtpChallengeService.normalizeEmail(body.getEmail());
    long emailRetry = requestEmailRateLimiter.tryConsumeOrRetryAfterSeconds(email);
    if (emailRetry >= 0) {
      securityEventLogger.log(EventType.AUTH_RATE_LIMITED, Result.FAILURE, null,
          email, ip, "otp", "otp-request");
      return rateLimited(emailRetry);
    }

    OtpRequestOutcome outcome = otpService.requestOrResend(email, body.getPurpose());
    if (outcome instanceof OtpRequestOutcome.ResendCooldown cooldown) {
      return rateLimited(Math.max(1L, cooldown.retryAfter().getSeconds()));
    }
    if (outcome instanceof OtpRequestOutcome.ResendExhausted) {
      return accepted();
    }

    securityEventLogger.log(EventType.AUTH_OTP_REQUESTED, Result.SUCCESS, null, email, ip, "otp");
    return accepted();
  }

  @PostMapping("/resend")
  public ResponseEntity<ApiResponse<OtpAcceptedResponseDto>> resend(
      @Valid @RequestBody OtpRequestDto body, HttpServletRequest httpRequest) {
    return request(body, httpRequest);
  }

  @PostMapping("/verify")
  public ResponseEntity<ApiResponse<AuthPayload>> verify(@Valid @RequestBody OtpVerifyDto body,
      HttpServletRequest httpRequest, HttpServletResponse response) {
    String ip = ClientIpResolver.resolve(httpRequest);
    long ipRetry = verifyIpRateLimiter.tryConsumeOrRetryAfterSeconds(ip);
    if (ipRetry >= 0) {
      securityEventLogger.log(EventType.AUTH_RATE_LIMITED, Result.FAILURE, null,
          body.getEmail(), ip, "otp", "otp-verify");
      return verifyRateLimited(ipRetry);
    }

    String email = EmailOtpChallengeService.normalizeEmail(body.getEmail());
    long emailRetry = verifyEmailRateLimiter.tryConsumeOrRetryAfterSeconds(email);
    if (emailRetry >= 0) {
      securityEventLogger.log(EventType.AUTH_RATE_LIMITED, Result.FAILURE, null,
          email, ip, "otp", "otp-verify");
      return verifyRateLimited(emailRetry);
    }

    OtpVerifyOutcome outcome = otpService.verify(email, body.getPurpose(), body.getCode());

    if (outcome instanceof OtpVerifyOutcome.Success success) {
      securityEventLogger.log(EventType.AUTH_OTP_VERIFIED, Result.SUCCESS,
          success.auth().getUser().getId(), email, ip, "otp");
      issueRefreshAndWriteCookies(response, success.auth());
      return ResponseEntity.ok(ApiResponse.ok(success.auth()));
    }
    if (outcome instanceof OtpVerifyOutcome.Locked locked) {
      securityEventLogger.log(EventType.AUTH_OTP_FAILED, Result.FAILURE, null,
          email, ip, "otp", "locked");
      return verifyRateLimited(Math.max(1L, locked.retryAfter().getSeconds()));
    }
    if (outcome instanceof OtpVerifyOutcome.CannotCompleteSignIn) {
      securityEventLogger.log(EventType.AUTH_OTP_FAILED, Result.FAILURE, null,
          email, ip, "otp", "no-account");
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(ApiResponse.fail("Unable to complete sign-in. Please register first."));
    }

    securityEventLogger.log(EventType.AUTH_OTP_FAILED, Result.FAILURE, null,
        email, ip, "otp", "invalid-code");
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.fail(VERIFY_FAIL_MSG));
  }

  private ResponseEntity<ApiResponse<OtpAcceptedResponseDto>> accepted() {
    return ResponseEntity.ok(ApiResponse.ok(OtpAcceptedResponseDto.standard()));
  }

  private ResponseEntity<ApiResponse<OtpAcceptedResponseDto>> rateLimited(long retryAfterSec) {
    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
        .header(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfterSec))
        .body(ApiResponse.fail(RATE_LIMIT_MSG));
  }

  private ResponseEntity<ApiResponse<AuthPayload>> verifyRateLimited(long retryAfterSec) {
    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
        .header(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfterSec))
        .body(ApiResponse.fail(RATE_LIMIT_MSG));
  }

  private void issueRefreshAndWriteCookies(HttpServletResponse response, AuthPayload payload) {
    UserEntity user = userRepository.findById(payload.getUser().getId())
        .orElseThrow(() -> new IllegalStateException(
            "User not found after OTP verify: " + payload.getUser().getId()));
    String refreshRaw = refreshTokenService.issueRefreshToken(user);
    authCookieWriter.writeAuthCookies(response, payload.getToken(), payload.getCsrfToken(),
        refreshRaw);
  }
}
