package com.univoyage.auth.password;

import com.univoyage.auth.config.EmailVerificationSecurityProperties;
import com.univoyage.auth.config.PasswordResetSecurityProperties;
import com.univoyage.auth.model.UserEmailToken;
import com.univoyage.auth.repository.UserEmailTokenRepository;
import com.univoyage.auth.security.SecretTokenHasher;
import com.univoyage.user.model.UserEntity;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import java.time.Clock;
import java.time.Instant;

@Component
@RequiredArgsConstructor
public class UserEmailTokenIssuer {

  private final UserEmailTokenRepository tokenRepository;
  private final PasswordResetSecurityProperties passwordResetProperties;
  private final EmailVerificationSecurityProperties emailVerificationProperties;
  private final Clock clock;

  /**
   * Invalidates prior active tokens and issues a new single-use token.
   *
   * @return raw secret for the email link (never persisted)
   */
  @Transactional
  public String issue(UserEntity user, String normalizedEmail, UserEmailTokenPurpose purpose) {
    Instant now = clock.instant();
    tokenRepository.invalidateActiveTokens(normalizedEmail, purpose, now);
    tokenRepository.flush();

    String raw = SecretTokenHasher.newRawToken();
    DurationAndAttempts config = configFor(purpose);

    UserEmailToken entity = UserEmailToken.builder().user(user).email(normalizedEmail)
        .purpose(purpose).tokenHash(SecretTokenHasher.sha256Hex(raw))
        .expiresAt(now.plus(config.ttl)).maxAttempts(config.maxAttempts).createdAt(now).build();

    tokenRepository.save(entity);
    return raw;
  }

  private DurationAndAttempts configFor(UserEmailTokenPurpose purpose) {
    return switch (purpose) {
      case PASSWORD_RESET -> new DurationAndAttempts(passwordResetProperties.getTtl(),
          passwordResetProperties.getMaxAttemptsPerToken());
      case EMAIL_VERIFICATION -> new DurationAndAttempts(emailVerificationProperties.getTtl(),
          emailVerificationProperties.getMaxAttemptsPerToken());
    };
  }

  private record DurationAndAttempts(java.time.Duration ttl, int maxAttempts) {
  }
}
