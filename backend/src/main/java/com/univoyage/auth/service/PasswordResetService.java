package com.univoyage.auth.service;

import com.univoyage.auth.config.PasswordResetSecurityProperties;
import com.univoyage.auth.password.UserEmailNotificationPort;
import com.univoyage.auth.password.UserEmailTokenIssuer;
import com.univoyage.auth.password.UserEmailTokenPurpose;
import com.univoyage.auth.password.UserEmailTokenValidator;
import com.univoyage.auth.password.UserEmailTokenValidator.TokenValidationResult;
import com.univoyage.auth.service.EmailOtpChallengeService;
import com.univoyage.email.EmailAddressMasker;
import com.univoyage.email.exception.EmailDeliveryException;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.time.Clock;
import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Log4j2
public class PasswordResetService {

  private final UserRepository userRepository;
  private final UserEmailTokenIssuer tokenIssuer;
  private final UserEmailTokenValidator tokenValidator;
  private final UserEmailNotificationPort notificationPort;
  private final PasswordEncoder passwordEncoder;
  private final RefreshTokenService refreshTokenService;
  private final PasswordResetSecurityProperties properties;
  private final Clock clock;

  @Transactional
  public void requestForgot(String rawEmail) {
    String email = normalizeEmail(rawEmail);
    Optional<UserEntity> userOpt = userRepository.findByEmail(email);
    if (userOpt.isEmpty()) {
      log.info("Password reset requested for unknown recipient={}", EmailAddressMasker.mask(email));
      return;
    }

    UserEntity user = userOpt.get();
    String rawToken = tokenIssuer.issue(user, email, UserEmailTokenPurpose.PASSWORD_RESET);
    dispatchResetEmail(email, rawToken);
    log.info("Password reset token issued recipient={}", EmailAddressMasker.mask(email));
  }

  @Transactional
  public ResetOutcome resetPassword(String rawToken, String newPassword) {
    TokenValidationResult result = tokenValidator.validateAndConsume(rawToken,
        UserEmailTokenPurpose.PASSWORD_RESET);

    if (result instanceof TokenValidationResult.Valid valid) {
      UserEntity user = valid.token().getUser();
      Instant now = clock.instant();
      user.setPasswordHash(passwordEncoder.encode(newPassword));
      user.setFailedLoginAttempts(0);
      user.setLockedUntil(null);
      if (user.getEmailVerifiedAt() == null) {
        user.setEmailVerifiedAt(now);
      }
      userRepository.save(user);

      if (properties.isRevokeSessionsOnReset()) {
        refreshTokenService.revokeAllForUser(user.getId());
      }
      log.info("Password reset completed userId={}", user.getId());
      return ResetOutcome.SUCCESS;
    }
    return ResetOutcome.INVALID_TOKEN;
  }

  private void dispatchResetEmail(String email, String rawToken) {
    try {
      notificationPort.sendPasswordReset(email, rawToken);
    } catch (EmailDeliveryException ex) {
      log.error("Password reset email failed errorId={} recipient={}", ex.getErrorId(),
          EmailAddressMasker.mask(email), ex);
    } catch (RuntimeException ex) {
      log.error("Password reset email failed recipient={}", EmailAddressMasker.mask(email), ex);
    }
  }

  public static String normalizeEmail(String raw) {
    return EmailOtpChallengeService.normalizeEmail(raw);
  }

  public enum ResetOutcome {
    SUCCESS, INVALID_TOKEN
  }
}
