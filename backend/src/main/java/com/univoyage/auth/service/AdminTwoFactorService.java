package com.univoyage.auth.service;

import com.univoyage.admin.audit.service.CmsAuditService;
import com.univoyage.auth.otp.EmailOtpPurpose;
import com.univoyage.auth.otp.OtpRequestOutcome;
import com.univoyage.auth.otp.OtpVerifyOutcome;
import com.univoyage.auth.security.JwtService;
import com.univoyage.user.model.Role;
import com.univoyage.user.model.UserEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

/**
 * Orchestrates admin two-factor authentication using email OTP. Delegates
 * challenge creation and verification to the existing EmailOtpChallengeService,
 * then reissues the JWT with a tfa=true claim on success.
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class AdminTwoFactorService {

  private final EmailOtpChallengeService otpChallengeService;
  private final JwtService jwtService;
  private final CmsAuditService cmsAuditService;

  private static final EmailOtpPurpose PURPOSE = EmailOtpPurpose.ADMIN_LOGIN;

  public boolean isAdminRole(UserEntity user) {
    return user.getRole() == Role.ADMIN || user.getRole() == Role.HEAD_ADMIN;
  }

  /**
   * Sends a 2FA email OTP challenge to the admin's email.
   */
  public OtpRequestOutcome challenge(UserEntity user) {
    if (!isAdminRole(user)) {
      throw new IllegalStateException("Only ADMIN/HEAD_ADMIN users can request admin 2FA");
    }
    return otpChallengeService.requestOrResend(user.getEmail(), PURPOSE);
  }

  /**
   * Verifies the 2FA code. On success, returns a new JWT TokenPair with tfa=true.
   */
  public Admin2faVerifyResult verify(UserEntity user, String code, String ip) {
    if (!isAdminRole(user)) {
      throw new IllegalStateException("Only ADMIN/HEAD_ADMIN users can verify admin 2FA");
    }

    OtpVerifyOutcome outcome = otpChallengeService.verify(user.getEmail(), PURPOSE, code);

    if (outcome instanceof OtpVerifyOutcome.Success) {
      JwtService.TokenPair pair = jwtService.generateForUserWithTwoFactor(user);
      cmsAuditService.recordAdmin2faSuccess(user.getId(), user.getEmail(), ip);
      log.info("Admin 2FA verified userId={}", user.getId());
      return new Admin2faVerifyResult(true, pair, null, -1);
    }

    String reason = outcome.getClass().getSimpleName();
    cmsAuditService.recordAdmin2faFailed(user.getId(), user.getEmail(), ip, reason);

    if (outcome instanceof OtpVerifyOutcome.Locked locked) {
      return new Admin2faVerifyResult(false, null, "Too many failed attempts. Please try again later.",
          locked.retryAfter().getSeconds());
    }

    if (outcome instanceof OtpVerifyOutcome.InvalidCode invalidCode) {
      return new Admin2faVerifyResult(false, null,
          "Invalid verification code. " + invalidCode.attemptsRemaining() + " attempts remaining.", -1);
    }

    if (outcome instanceof OtpVerifyOutcome.Expired) {
      return new Admin2faVerifyResult(false, null,
          "Verification code has expired. Please request a new code.", -1);
    }

    if (outcome instanceof OtpVerifyOutcome.NoActiveChallenge) {
      return new Admin2faVerifyResult(false, null,
          "No active 2FA challenge. Please request a new code.", -1);
    }

    if (outcome instanceof OtpVerifyOutcome.AlreadyConsumed) {
      return new Admin2faVerifyResult(false, null,
          "Code already used. Please request a new code.", -1);
    }

    return new Admin2faVerifyResult(false, null, "Verification failed.", -1);
  }

  public record Admin2faVerifyResult(boolean success, JwtService.TokenPair tokenPair,
      String errorMessage, long retryAfterSeconds) {
  }
}
