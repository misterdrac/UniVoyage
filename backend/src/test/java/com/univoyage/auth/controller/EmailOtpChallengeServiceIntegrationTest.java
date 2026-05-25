package com.univoyage.auth.controller;

import com.univoyage.auth.model.EmailOtpChallenge;
import com.univoyage.auth.otp.EmailOtpPurpose;
import com.univoyage.auth.otp.OtpVerifyOutcome;
import com.univoyage.auth.otp.TestOtpNotificationPort;
import com.univoyage.auth.repository.EmailOtpChallengeRepository;
import com.univoyage.auth.service.EmailOtpChallengeService;
import com.univoyage.reference.country.model.Country;
import com.univoyage.reference.country.repository.CountryRepository;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {"app.auth.otp.auto-register-on-verify=true",
    "app.auth.otp.auto-register-country-code=MT"})
@ActiveProfiles("test")
@Transactional
class EmailOtpChallengeServiceIntegrationTest {

  @Autowired
  private EmailOtpChallengeService otpService;

  @Autowired
  private EmailOtpChallengeRepository challengeRepository;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private CountryRepository countryRepository;

  @Autowired
  private TestOtpNotificationPort testOtpNotificationPort;

  @BeforeEach
  void setUp() {
    testOtpNotificationPort.clear();
    if (countryRepository.findByIsoCode("MT").isEmpty()) {
      countryRepository.save(Country.builder().isoCode("MT").countryName("Malta")
          .currencyCode("EUR").currencyName("Euro").build());
    }
  }

  @Test
  @DisplayName("request issues record; verify consumes; second verify fails")
  void requestVerifyConsumeSecondFails() {
    otpService.requestOrResend("otp-flow@example.com", EmailOtpPurpose.REGISTER);
    String code = testOtpNotificationPort.lastCode("otp-flow@example.com",
        EmailOtpPurpose.REGISTER);
    assertThat(code).isNotBlank();

    EmailOtpChallenge active = challengeRepository
        .findActiveChallenge("otp-flow@example.com", EmailOtpPurpose.REGISTER).orElseThrow();
    assertThat(active.getOtpHash()).doesNotContain(code);
    assertThat(active.getConsumedAt()).isNull();

    OtpVerifyOutcome first = otpService.verify("otp-flow@example.com", EmailOtpPurpose.REGISTER,
        code);
    assertThat(first).isInstanceOf(OtpVerifyOutcome.Success.class);
    assertThat(userRepository.findByEmail("otp-flow@example.com")).isPresent();

    EmailOtpChallenge consumed = challengeRepository.findById(active.getId()).orElseThrow();
    assertThat(consumed.getConsumedAt()).isNotNull();

    OtpVerifyOutcome second = otpService.verify("otp-flow@example.com", EmailOtpPurpose.REGISTER,
        code);
    assertThat(second).isInstanceOf(OtpVerifyOutcome.AlreadyConsumed.class);
  }

  @Test
  @DisplayName("existing user LOGIN verify issues auth payload")
  void loginVerifyForExistingUser() {
    UserEntity user = userRepository
        .save(UserEntity.builder().email("existing@example.com").name("E").surname("X")
            .passwordHash("{noop}x").country(countryRepository.findByIsoCode("MT").orElseThrow())
            .dateOfRegister(Instant.now()).role(com.univoyage.user.model.Role.USER).build());

    otpService.requestOrResend(user.getEmail(), EmailOtpPurpose.LOGIN);
    String code = testOtpNotificationPort.lastCode(user.getEmail(), EmailOtpPurpose.LOGIN);

    OtpVerifyOutcome outcome = otpService.verify(user.getEmail(), EmailOtpPurpose.LOGIN, code);
    assertThat(outcome).isInstanceOf(OtpVerifyOutcome.Success.class);
  }
}
