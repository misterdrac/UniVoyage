package com.univoyage.auth.service;

import com.univoyage.auth.config.OtpSecurityProperties;
import com.univoyage.auth.model.EmailOtpChallenge;
import com.univoyage.auth.otp.EmailOtpPurpose;
import com.univoyage.auth.otp.OtpCodeGenerator;
import com.univoyage.auth.otp.OtpHasher;
import com.univoyage.auth.otp.OtpNotificationPort;
import com.univoyage.auth.otp.OtpRequestOutcome;
import com.univoyage.auth.otp.OtpVerifyOutcome;
import com.univoyage.auth.repository.EmailOtpChallengeRepository;
import com.univoyage.auth.security.JwtService;
import com.univoyage.reference.country.repository.CountryRepository;
import com.univoyage.user.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmailOtpChallengeServiceTest {

  private static final Instant NOW = Instant.parse("2026-05-01T12:00:00Z");

  @Mock
  private EmailOtpChallengeRepository challengeRepository;
  @Mock
  private UserRepository userRepository;
  @Mock
  private CountryRepository countryRepository;
  @Mock
  private OtpNotificationPort notificationPort;
  @Mock
  private JwtService jwtService;
  @Mock
  private OtpCodeGenerator codeGenerator;

  private OtpSecurityProperties properties;
  private OtpHasher otpHasher;
  private EmailOtpChallengeService service;

  @BeforeEach
  void setUp() {
    properties = new OtpSecurityProperties();
    properties.setTtl(Duration.ofMinutes(10));
    properties.setResendCooldown(Duration.ofMinutes(1));
    properties.setMaxResendsPerChallenge(2);
    properties.setMaxVerifyAttemptsPerChallenge(3);
    properties.setVerifyLockDuration(Duration.ofMinutes(15));

    otpHasher = new OtpHasher(new BCryptPasswordEncoder());
    Clock clock = Clock.fixed(NOW, ZoneOffset.UTC);

    service = new EmailOtpChallengeService(challengeRepository, userRepository, countryRepository,
        properties, codeGenerator, otpHasher, notificationPort, jwtService,
        new BCryptPasswordEncoder(), clock);
  }

  @Test
  @DisplayName("request creates challenge with hash only (code sent via notification port)")
  void requestCreatesHashedChallenge() {
    when(codeGenerator.generate()).thenReturn("112233");
    when(challengeRepository.findActiveChallenge("a@example.com", EmailOtpPurpose.LOGIN))
        .thenReturn(Optional.empty());

    OtpRequestOutcome outcome = service.requestOrResend("a@example.com", EmailOtpPurpose.LOGIN);

    assertThat(outcome).isInstanceOf(OtpRequestOutcome.Accepted.class);
    ArgumentCaptor<EmailOtpChallenge> captor = ArgumentCaptor.forClass(EmailOtpChallenge.class);
    verify(challengeRepository).save(captor.capture());
    EmailOtpChallenge saved = captor.getValue();
    assertThat(saved.getOtpHash()).isNotEqualTo("112233");
    assertThat(otpHasher.matches("112233", saved.getOtpHash())).isTrue();
    assertThat(saved.getExpiresAt()).isEqualTo(NOW.plus(Duration.ofMinutes(10)));
    verify(notificationPort).send("a@example.com", EmailOtpPurpose.LOGIN, "112233");
  }

  @Test
  @DisplayName("verify with correct code consumes challenge")
  void verifyConsumesChallenge() {
    String hash = otpHasher.hash("445566");
    EmailOtpChallenge challenge = EmailOtpChallenge.builder().email("b@example.com")
        .purpose(EmailOtpPurpose.LOGIN).otpHash(hash).expiresAt(NOW.plus(Duration.ofMinutes(5)))
        .maxAttempts(3).maxResends(2).lastSentAt(NOW).nextResendAt(NOW.plus(Duration.ofMinutes(1)))
        .build();

    when(challengeRepository.findActiveChallenge("b@example.com", EmailOtpPurpose.LOGIN))
        .thenReturn(Optional.of(challenge));
    when(userRepository.findByEmail("b@example.com")).thenReturn(Optional.empty());

    OtpVerifyOutcome outcome = service.verify("b@example.com", EmailOtpPurpose.LOGIN, "445566");

    assertThat(outcome).isInstanceOf(OtpVerifyOutcome.CannotCompleteSignIn.class);
    assertThat(challenge.getConsumedAt()).isEqualTo(NOW);
    verify(challengeRepository).save(challenge);
  }

  @Test
  @DisplayName("expired challenge returns Expired at clock edge")
  void verifyExpiredAtEdge() {
    String hash = otpHasher.hash("999999");
    EmailOtpChallenge challenge = EmailOtpChallenge.builder().email("c@example.com")
        .purpose(EmailOtpPurpose.LOGIN).otpHash(hash).expiresAt(NOW).maxAttempts(3).maxResends(2)
        .lastSentAt(NOW.minus(Duration.ofMinutes(10))).nextResendAt(NOW).build();

    when(challengeRepository.findActiveChallenge("c@example.com", EmailOtpPurpose.LOGIN))
        .thenReturn(Optional.of(challenge));

    OtpVerifyOutcome outcome = service.verify("c@example.com", EmailOtpPurpose.LOGIN, "999999");

    assertThat(outcome).isInstanceOf(OtpVerifyOutcome.Expired.class);
  }

  @Test
  @DisplayName("wrong code increments attempt_count")
  void wrongCodeIncrementsAttempts() {
    String hash = otpHasher.hash("111111");
    EmailOtpChallenge challenge = EmailOtpChallenge.builder().email("d@example.com")
        .purpose(EmailOtpPurpose.LOGIN).otpHash(hash).expiresAt(NOW.plus(Duration.ofMinutes(5)))
        .maxAttempts(3).maxResends(2).lastSentAt(NOW).nextResendAt(NOW.plus(Duration.ofMinutes(1)))
        .attemptCount(0).build();

    when(challengeRepository.findActiveChallenge("d@example.com", EmailOtpPurpose.LOGIN))
        .thenReturn(Optional.of(challenge));

    OtpVerifyOutcome outcome = service.verify("d@example.com", EmailOtpPurpose.LOGIN, "000000");

    assertThat(outcome).isInstanceOf(OtpVerifyOutcome.InvalidCode.class);
    assertThat(challenge.getAttemptCount()).isEqualTo(1);
    verify(challengeRepository).save(challenge);
  }

  @Test
  @DisplayName("resend within cooldown returns ResendCooldown")
  void resendBlockedByCooldown() {
    EmailOtpChallenge existing = EmailOtpChallenge.builder().email("e@example.com")
        .purpose(EmailOtpPurpose.LOGIN).otpHash("x").expiresAt(NOW.plus(Duration.ofMinutes(5)))
        .maxAttempts(3).maxResends(3).resendCount(0).lastSentAt(NOW)
        .nextResendAt(NOW.plus(Duration.ofMinutes(2))).build();

    when(challengeRepository.findActiveChallenge(eq("e@example.com"), any()))
        .thenReturn(Optional.of(existing));

    OtpRequestOutcome outcome = service.requestOrResend("e@example.com", EmailOtpPurpose.LOGIN);

    assertThat(outcome).isInstanceOf(OtpRequestOutcome.ResendCooldown.class);
  }
}
