package com.univoyage.auth.service;

import com.univoyage.auth.config.OtpSecurityProperties;
import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.model.EmailOtpChallenge;
import com.univoyage.auth.otp.EmailOtpPurpose;
import com.univoyage.auth.otp.OtpCodeGenerator;
import com.univoyage.auth.otp.OtpHasher;
import com.univoyage.auth.otp.OtpNotificationPort;
import com.univoyage.email.EmailAddressMasker;
import com.univoyage.email.exception.EmailDeliveryException;
import com.univoyage.auth.otp.OtpRequestOutcome;
import com.univoyage.auth.otp.OtpVerifyOutcome;
import com.univoyage.auth.repository.EmailOtpChallengeRepository;
import com.univoyage.auth.security.JwtService;
import com.univoyage.reference.country.model.Country;
import com.univoyage.reference.country.repository.CountryRepository;
import com.univoyage.user.dto.UserDto;
import com.univoyage.user.model.Role;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Log4j2
public class EmailOtpChallengeService {

  private final EmailOtpChallengeRepository challengeRepository;
  private final UserRepository userRepository;
  private final CountryRepository countryRepository;
  private final OtpSecurityProperties properties;
  private final OtpCodeGenerator codeGenerator;
  private final OtpHasher otpHasher;
  private final OtpNotificationPort notificationPort;
  private final JwtService jwtService;
  private final PasswordEncoder passwordEncoder;
  private final Clock clock;

  @Transactional
  public OtpRequestOutcome requestOrResend(String rawEmail, EmailOtpPurpose purpose) {
    if (purpose == EmailOtpPurpose.PASSWORD_RESET) {
      return new OtpRequestOutcome.Accepted();
    }
    String email = normalizeEmail(rawEmail);
    Instant now = clock.instant();

    Optional<EmailOtpChallenge> existing = challengeRepository.findActiveChallenge(email, purpose);
    if (existing.isPresent()) {
      EmailOtpChallenge challenge = existing.get();
      if (!challenge.isActiveAt(now)) {
        invalidateAndCreate(email, purpose, now);
        return new OtpRequestOutcome.Accepted();
      }
      if (challenge.getLockedUntil() != null && challenge.getLockedUntil().isAfter(now)) {
        return new OtpRequestOutcome.ResendCooldown(
            Duration.between(now, challenge.getLockedUntil()));
      }
      if (challenge.getResendCount() >= challenge.getMaxResends()) {
        return new OtpRequestOutcome.ResendExhausted();
      }
      if (challenge.getNextResendAt().isAfter(now)) {
        return new OtpRequestOutcome.ResendCooldown(
            Duration.between(now, challenge.getNextResendAt()));
      }
      resendChallenge(challenge, now);
      return new OtpRequestOutcome.Accepted();
    }

    invalidateAndCreate(email, purpose, now);
    return new OtpRequestOutcome.Accepted();
  }

  @Transactional
  public OtpVerifyOutcome verify(String rawEmail, EmailOtpPurpose purpose, String rawCode) {
    if (purpose == EmailOtpPurpose.PASSWORD_RESET) {
      return new OtpVerifyOutcome.NoActiveChallenge();
    }
    String email = normalizeEmail(rawEmail);
    String code = normalizeCode(rawCode);
    Instant now = clock.instant();

    Optional<EmailOtpChallenge> opt = challengeRepository.findActiveChallenge(email, purpose);
    if (opt.isEmpty()) {
      return challengeRepository
          .findTopByEmailIgnoreCaseAndPurposeOrderByCreatedAtDesc(email, purpose)
          .filter(c -> c.getConsumedAt() != null)
          .<OtpVerifyOutcome>map(c -> new OtpVerifyOutcome.AlreadyConsumed())
          .orElse(new OtpVerifyOutcome.NoActiveChallenge());
    }

    EmailOtpChallenge challenge = opt.get();
    if (!challenge.getExpiresAt().isAfter(now)) {
      return new OtpVerifyOutcome.Expired();
    }
    if (challenge.getLockedUntil() != null && challenge.getLockedUntil().isAfter(now)) {
      return new OtpVerifyOutcome.Locked(Duration.between(now, challenge.getLockedUntil()));
    }

    if (otpHasher.matches(code, challenge.getOtpHash())) {
      challenge.setConsumedAt(now);
      challengeRepository.save(challenge);
      return completeVerification(email, purpose);
    }

    challenge.setAttemptCount(challenge.getAttemptCount() + 1);
    int remaining = challenge.getMaxAttempts() - challenge.getAttemptCount();
    if (challenge.getAttemptCount() >= challenge.getMaxAttempts()) {
      challenge.setLockedUntil(now.plus(properties.getVerifyLockDuration()));
      remaining = 0;
    }
    challengeRepository.save(challenge);

    if (remaining <= 0) {
      return new OtpVerifyOutcome.Locked(
          Duration.ofSeconds(properties.getVerifyLockDuration().getSeconds()));
    }
    return new OtpVerifyOutcome.InvalidCode(remaining);
  }

  private void invalidateAndCreate(String email, EmailOtpPurpose purpose, Instant now) {
    challengeRepository.invalidateActiveChallenges(email, purpose, now);
    challengeRepository.flush();

    String plainCode = codeGenerator.generate();
    EmailOtpChallenge challenge = EmailOtpChallenge.builder().email(email).purpose(purpose)
        .otpHash(otpHasher.hash(plainCode)).expiresAt(now.plus(properties.getTtl()))
        .maxAttempts(properties.getMaxVerifyAttemptsPerChallenge())
        .maxResends(properties.getMaxResendsPerChallenge()).lastSentAt(now)
        .nextResendAt(now.plus(properties.getResendCooldown())).build();

    challengeRepository.save(challenge);
    dispatchCode(email, purpose, plainCode);
    log.info("OTP challenge created purpose={} recipient={}", purpose,
        EmailAddressMasker.mask(email));
  }

  private void resendChallenge(EmailOtpChallenge challenge, Instant now) {
    String plainCode = codeGenerator.generate();
    challenge.setOtpHash(otpHasher.hash(plainCode));
    challenge.setResendCount(challenge.getResendCount() + 1);
    challenge.setLastSentAt(now);
    challenge.setNextResendAt(now.plus(properties.getResendCooldown()));
    challenge.setExpiresAt(now.plus(properties.getTtl()));
    challenge.setAttemptCount(0);
    challenge.setLockedUntil(null);
    challengeRepository.save(challenge);
    dispatchCode(challenge.getEmail(), challenge.getPurpose(), plainCode);
    log.info("OTP challenge resent purpose={} recipient={}", challenge.getPurpose(),
        EmailAddressMasker.mask(challenge.getEmail()));
  }

  private void dispatchCode(String email, EmailOtpPurpose purpose, String plainCode) {
    try {
      notificationPort.send(email, purpose, plainCode);
    } catch (EmailDeliveryException ex) {
      log.error("OTP delivery failed errorId={} purpose={} recipient={}", ex.getErrorId(), purpose,
          EmailAddressMasker.mask(email), ex);
    } catch (RuntimeException ex) {
      log.error("OTP delivery failed purpose={} recipient={}", purpose,
          EmailAddressMasker.mask(email), ex);
    }
  }

  private OtpVerifyOutcome completeVerification(String email, EmailOtpPurpose purpose) {
    Optional<UserEntity> userOpt = userRepository.findByEmail(email);
    if (userOpt.isEmpty()) {
      if (purpose == EmailOtpPurpose.REGISTER && properties.isAutoRegisterOnVerify()) {
        UserEntity created = autoRegister(email);
        return issueAuth(created);
      }
      return new OtpVerifyOutcome.CannotCompleteSignIn();
    }
    UserEntity user = userOpt.get();
    user.setDateOfLastSignin(clock.instant());
    userRepository.save(user);
    return issueAuth(user);
  }

  private UserEntity autoRegister(String email) {
    Country country = countryRepository.findByIsoCode(properties.getAutoRegisterCountryCode())
        .orElseThrow(() -> new IllegalStateException(
            "Auto-register country not found: " + properties.getAutoRegisterCountryCode()));
    Instant now = clock.instant();
    String localPart = email.substring(0, email.indexOf('@'));
    UserEntity user = UserEntity.builder().email(email).name(localPart).surname("User")
        .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString())).country(country)
        .dateOfRegister(now).dateOfLastSignin(now).role(Role.USER).build();
    return userRepository.save(user);
  }

  private OtpVerifyOutcome issueAuth(UserEntity user) {
    JwtService.TokenPair pair = jwtService.generateForUser(user);
    return new OtpVerifyOutcome.Success(
        AuthPayload.ok(UserDto.from(user), pair.jwt(), pair.csrfSecret()));
  }

  public static String normalizeEmail(String raw) {
    if (raw == null) {
      throw new IllegalArgumentException("Email is required");
    }
    return raw.trim().toLowerCase(Locale.ROOT);
  }

  public static String normalizeCode(String raw) {
    if (raw == null) {
      throw new IllegalArgumentException("Code is required");
    }
    return raw.trim();
  }
}
