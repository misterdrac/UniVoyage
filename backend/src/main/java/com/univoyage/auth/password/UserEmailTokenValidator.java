package com.univoyage.auth.password;

import com.univoyage.auth.model.UserEmailToken;
import com.univoyage.auth.repository.UserEmailTokenRepository;
import com.univoyage.auth.security.SecretTokenHasher;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import java.time.Clock;
import java.time.Instant;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class UserEmailTokenValidator {

  private final UserEmailTokenRepository tokenRepository;
  private final Clock clock;

  @Transactional(readOnly = true)
  public TokenValidationResult peek(String rawToken, UserEmailTokenPurpose purpose) {
    return resolve(rawToken, purpose, false);
  }

  @Transactional
  public TokenValidationResult validateAndConsume(String rawToken, UserEmailTokenPurpose purpose) {
    return resolve(rawToken, purpose, true);
  }

  private TokenValidationResult resolve(String rawToken, UserEmailTokenPurpose purpose,
      boolean consume) {
    if (rawToken == null || rawToken.isBlank()) {
      return TokenValidationResult.invalid();
    }
    String hash = SecretTokenHasher.sha256Hex(rawToken.trim());
    Optional<UserEmailToken> opt = tokenRepository.findByTokenHash(hash);
    if (opt.isEmpty()) {
      return TokenValidationResult.invalid();
    }

    UserEmailToken token = opt.get();
    Instant now = clock.instant();

    if (token.getPurpose() != purpose) {
      return TokenValidationResult.invalid();
    }
    if (token.getConsumedAt() != null) {
      return TokenValidationResult.alreadyUsed();
    }
    if (token.getInvalidatedAt() != null || !token.getExpiresAt().isAfter(now)) {
      return TokenValidationResult.expired();
    }

    if (consume) {
      token.setConsumedAt(now);
      tokenRepository.save(token);
    }
    return TokenValidationResult.valid(token);
  }

  public sealed interface TokenValidationResult {

    record Valid(UserEmailToken token) implements TokenValidationResult {
    }

    record Invalid() implements TokenValidationResult {
    }

    record Expired() implements TokenValidationResult {
    }

    record AlreadyUsed() implements TokenValidationResult {
    }

    record Locked() implements TokenValidationResult {
    }

    static TokenValidationResult valid(UserEmailToken token) {
      return new Valid(token);
    }

    static TokenValidationResult invalid() {
      return new Invalid();
    }

    static TokenValidationResult expired() {
      return new Expired();
    }

    static TokenValidationResult alreadyUsed() {
      return new AlreadyUsed();
    }

    static TokenValidationResult locked() {
      return new Locked();
    }
  }
}
