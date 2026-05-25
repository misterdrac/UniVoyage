package com.univoyage.auth.service;

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
public class EmailVerificationService {

  private final UserRepository userRepository;
  private final UserEmailTokenIssuer tokenIssuer;
  private final UserEmailTokenValidator tokenValidator;
  private final UserEmailNotificationPort notificationPort;
  private final Clock clock;

  @Transactional
  public void requestVerification(String rawEmail) {
    String email = PasswordResetService.normalizeEmail(rawEmail);
    Optional<UserEntity> userOpt = userRepository.findByEmail(email);
    if (userOpt.isEmpty()) {
      log.info("Email verification requested for unknown recipient={}",
          EmailAddressMasker.mask(email));
      return;
    }

    UserEntity user = userOpt.get();
    if (user.isEmailVerified()) {
      log.info("Email verification skipped already verified recipient={}",
          EmailAddressMasker.mask(email));
      return;
    }

    String rawToken = tokenIssuer.issue(user, email, UserEmailTokenPurpose.EMAIL_VERIFICATION);
    dispatchVerificationEmail(email, rawToken);
    log.info("Email verification token issued recipient={}", EmailAddressMasker.mask(email));
  }

  @Transactional
  public ConfirmOutcome confirm(String rawToken) {
    TokenValidationResult result = tokenValidator.validateAndConsume(rawToken,
        UserEmailTokenPurpose.EMAIL_VERIFICATION);

    if (result instanceof TokenValidationResult.Valid valid) {
      UserEntity user = valid.token().getUser();
      if (user.getEmailVerifiedAt() == null) {
        user.setEmailVerifiedAt(clock.instant());
        userRepository.save(user);
      }
      log.info("Email verified userId={}", user.getId());
      return ConfirmOutcome.SUCCESS;
    }

    return ConfirmOutcome.INVALID_TOKEN;
  }

  private void dispatchVerificationEmail(String email, String rawToken) {
    try {
      notificationPort.sendEmailVerification(email, rawToken);
    } catch (EmailDeliveryException ex) {
      log.error("Email verification send failed errorId={} recipient={}", ex.getErrorId(),
          EmailAddressMasker.mask(email), ex);
    } catch (RuntimeException ex) {
      log.error("Email verification send failed recipient={}", EmailAddressMasker.mask(email), ex);
    }
  }

  public enum ConfirmOutcome {
    SUCCESS, INVALID_TOKEN
  }
}
