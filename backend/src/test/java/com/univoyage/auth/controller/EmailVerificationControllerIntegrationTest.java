package com.univoyage.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.auth.model.UserEmailToken;
import com.univoyage.auth.password.TestUserEmailNotificationPort;
import com.univoyage.auth.password.UserEmailTokenPurpose;
import com.univoyage.auth.repository.UserEmailTokenRepository;
import com.univoyage.auth.security.SecretTokenHasher;
import com.univoyage.reference.country.model.Country;
import com.univoyage.reference.country.repository.CountryRepository;
import com.univoyage.user.model.Role;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class EmailVerificationControllerIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private TestUserEmailNotificationPort testEmailPort;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private CountryRepository countryRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  @Autowired
  private UserEmailTokenRepository userEmailTokenRepository;

  @BeforeEach
  void seed() {
    testEmailPort.clear();
    if (countryRepository.findByIsoCode("MT").isEmpty()) {
      countryRepository.save(Country.builder().isoCode("MT").countryName("Malta")
          .currencyCode("EUR").currencyName("Euro").build());
    }
  }

  @Test
  @DisplayName("verification request is enumeration-safe")
  void requestDoesNotEnumerate() throws Exception {
    userRepository.save(unverifiedUser("verify@example.com"));

    mockMvc
        .perform(
            post("/api/auth/email/verification/request").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("email", "verify@example.com"))))
        .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true));

    mockMvc
        .perform(
            post("/api/auth/email/verification/request").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("email", "ghost@example.com"))))
        .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true));

    assertThat(
        testEmailPort.lastToken("verify@example.com", UserEmailTokenPurpose.EMAIL_VERIFICATION))
        .isNotBlank();
    assertThat(
        testEmailPort.lastToken("ghost@example.com", UserEmailTokenPurpose.EMAIL_VERIFICATION))
        .isNull();
  }

  @Test
  @DisplayName("expired verification token is rejected")
  void confirmRejectsExpiredToken() throws Exception {
    userRepository.save(unverifiedUser("expired-verify@example.com"));

    mockMvc
        .perform(post("/api/auth/email/verification/request")
            .contentType(MediaType.APPLICATION_JSON).content(
                objectMapper.writeValueAsString(Map.of("email", "expired-verify@example.com"))))
        .andExpect(status().isOk());

    String token = testEmailPort.lastToken("expired-verify@example.com",
        UserEmailTokenPurpose.EMAIL_VERIFICATION);
    assertThat(token).isNotBlank();
    expireToken(token);

    mockMvc
        .perform(
            post("/api/auth/email/verification/confirm").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("token", token))))
        .andExpect(status().isBadRequest()).andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.error").value(
            "Invalid or expired verification link. Please request a new verification email."));

    UserEntity user = userRepository.findByEmail("expired-verify@example.com").orElseThrow();
    assertThat(user.getEmailVerifiedAt()).isNull();
  }

  @Test
  @DisplayName("confirm consumes token and sets email_verified_at")
  void confirmVerifiesEmail() throws Exception {
    userRepository.save(unverifiedUser("confirm@example.com"));

    mockMvc
        .perform(
            post("/api/auth/email/verification/request").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("email", "confirm@example.com"))))
        .andExpect(status().isOk());

    String token = testEmailPort.lastToken("confirm@example.com",
        UserEmailTokenPurpose.EMAIL_VERIFICATION);
    mockMvc
        .perform(
            post("/api/auth/email/verification/confirm").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("token", token))))
        .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true));

    UserEntity user = userRepository.findByEmail("confirm@example.com").orElseThrow();
    assertThat(user.getEmailVerifiedAt()).isNotNull();

    mockMvc
        .perform(
            post("/api/auth/email/verification/confirm").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("token", token))))
        .andExpect(status().isBadRequest());
  }

  private void expireToken(String rawToken) {
    String hash = SecretTokenHasher.sha256Hex(rawToken);
    UserEmailToken token = userEmailTokenRepository.findByTokenHash(hash).orElseThrow();
    token.setExpiresAt(Instant.now().minusSeconds(60));
    userEmailTokenRepository.saveAndFlush(token);
  }

  private UserEntity unverifiedUser(String email) {
    return UserEntity.builder().email(email).name("V").surname("U")
        .passwordHash(passwordEncoder.encode("OldPass1"))
        .country(countryRepository.findByIsoCode("MT").orElseThrow()).dateOfRegister(Instant.now())
        .role(Role.USER).build();
  }
}
