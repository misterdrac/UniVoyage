package com.univoyage.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.auth.model.RefreshTokenEntity;
import com.univoyage.auth.model.UserEmailToken;
import com.univoyage.auth.password.TestUserEmailNotificationPort;
import com.univoyage.auth.password.UserEmailTokenPurpose;
import com.univoyage.auth.repository.RefreshTokenRepository;
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
class PasswordResetControllerIntegrationTest {

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
  private RefreshTokenRepository refreshTokenRepository;

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
  @DisplayName("forgot returns same response for existing and unknown email")
  void forgotDoesNotEnumerateEmail() throws Exception {
    userRepository.save(user("known@example.com", "OldPass1"));

    String known = objectMapper.writeValueAsString(Map.of("email", "known@example.com"));
    String unknown = objectMapper.writeValueAsString(Map.of("email", "unknown@example.com"));

    mockMvc
        .perform(post("/api/auth/password/forgot").contentType(MediaType.APPLICATION_JSON)
            .content(known))
        .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.message").exists());

    mockMvc
        .perform(post("/api/auth/password/forgot").contentType(MediaType.APPLICATION_JSON)
            .content(unknown))
        .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.message").exists());

    assertThat(testEmailPort.lastToken("known@example.com", UserEmailTokenPurpose.PASSWORD_RESET))
        .isNotBlank();
    assertThat(testEmailPort.lastToken("unknown@example.com", UserEmailTokenPurpose.PASSWORD_RESET))
        .isNull();
  }

  @Test
  @DisplayName("reset with valid token updates password and revokes sessions")
  void resetWithValidToken() throws Exception {
    UserEntity user = userRepository.save(user("reset@example.com", "OldPass1"));
    refreshTokenRepository.save(RefreshTokenEntity.builder().user(user).tokenHash("dummyhash")
        .expiresAt(Instant.now().plusSeconds(3600)).createdAt(Instant.now()).build());

    mockMvc
        .perform(post("/api/auth/password/forgot").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("email", "reset@example.com"))))
        .andExpect(status().isOk());

    String token = testEmailPort.lastToken("reset@example.com",
        UserEmailTokenPurpose.PASSWORD_RESET);
    assertThat(token).isNotBlank();

    String resetBody = objectMapper
        .writeValueAsString(Map.of("token", token, "newPassword", "NewPass9"));
    mockMvc
        .perform(post("/api/auth/password/reset").contentType(MediaType.APPLICATION_JSON)
            .content(resetBody))
        .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true));

    UserEntity updated = userRepository.findByEmail("reset@example.com").orElseThrow();
    assertThat(passwordEncoder.matches("NewPass9", updated.getPasswordHash())).isTrue();
    assertThat(updated.getEmailVerifiedAt()).isNotNull();
    assertThat(refreshTokenRepository.findAll())
        .filteredOn(r -> r.getUser().getId().equals(user.getId())).isEmpty();
  }

  @Test
  @DisplayName("expired reset token is rejected")
  void resetRejectsExpiredToken() throws Exception {
    userRepository.save(user("expired@example.com", "OldPass1"));

    mockMvc
        .perform(post("/api/auth/password/forgot").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("email", "expired@example.com"))))
        .andExpect(status().isOk());

    String token = testEmailPort.lastToken("expired@example.com",
        UserEmailTokenPurpose.PASSWORD_RESET);
    assertThat(token).isNotBlank();
    expireToken(token, UserEmailTokenPurpose.PASSWORD_RESET);

    String resetBody = objectMapper
        .writeValueAsString(Map.of("token", token, "newPassword", "NewPass9"));
    mockMvc
        .perform(post("/api/auth/password/reset").contentType(MediaType.APPLICATION_JSON)
            .content(resetBody))
        .andExpect(status().isBadRequest()).andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.error")
            .value("Invalid or expired reset link. Please request a new password reset."));

    UserEntity unchanged = userRepository.findByEmail("expired@example.com").orElseThrow();
    assertThat(passwordEncoder.matches("OldPass1", unchanged.getPasswordHash())).isTrue();
  }

  @Test
  @DisplayName("invalid and reused tokens are rejected")
  void resetRejectsBadTokens() throws Exception {
    userRepository.save(user("bad@example.com", "OldPass1"));

    mockMvc
        .perform(post("/api/auth/password/forgot").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("email", "bad@example.com"))))
        .andExpect(status().isOk());

    String token = testEmailPort.lastToken("bad@example.com", UserEmailTokenPurpose.PASSWORD_RESET);
    String resetBody = objectMapper
        .writeValueAsString(Map.of("token", token, "newPassword", "NewPass9"));

    mockMvc.perform(
        post("/api/auth/password/reset").contentType(MediaType.APPLICATION_JSON).content(resetBody))
        .andExpect(status().isOk());

    mockMvc.perform(
        post("/api/auth/password/reset").contentType(MediaType.APPLICATION_JSON).content(resetBody))
        .andExpect(status().isBadRequest());

    String invalidBody = objectMapper
        .writeValueAsString(Map.of("token", "not-a-real-token", "newPassword", "NewPass9"));
    mockMvc.perform(post("/api/auth/password/reset").contentType(MediaType.APPLICATION_JSON)
        .content(invalidBody)).andExpect(status().isBadRequest());

    assertThat(userEmailTokenRepository.findAll()).isNotEmpty();
  }

  @Test
  @DisplayName("weak password rejected on reset")
  void resetRejectsWeakPassword() throws Exception {
    userRepository.save(user("weak@example.com", "OldPass1"));
    mockMvc
        .perform(post("/api/auth/password/forgot").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("email", "weak@example.com"))))
        .andExpect(status().isOk());

    String token = testEmailPort.lastToken("weak@example.com",
        UserEmailTokenPurpose.PASSWORD_RESET);
    String body = objectMapper.writeValueAsString(Map.of("token", token, "newPassword", "short"));
    mockMvc
        .perform(
            post("/api/auth/password/reset").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isBadRequest());
  }

  private void expireToken(String rawToken, UserEmailTokenPurpose purpose) {
    String hash = SecretTokenHasher.sha256Hex(rawToken);
    UserEmailToken token = userEmailTokenRepository.findByTokenHash(hash).orElseThrow();
    token.setExpiresAt(Instant.now().minusSeconds(60));
    userEmailTokenRepository.saveAndFlush(token);
  }

  private UserEntity user(String email, String rawPassword) {
    return UserEntity.builder().email(email).name("T").surname("U")
        .passwordHash(passwordEncoder.encode(rawPassword))
        .country(countryRepository.findByIsoCode("MT").orElseThrow()).dateOfRegister(Instant.now())
        .role(Role.USER).build();
  }
}
