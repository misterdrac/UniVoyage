package com.univoyage.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {"app.auth.password-reset.forgot-ip-max-attempts=3",
    "app.auth.password-reset.forgot-ip-window=PT1H",
    "app.auth.password-reset.forgot-email-max-attempts=2",
    "app.auth.password-reset.forgot-email-window=PT1H",
    "app.auth.password-reset.reset-ip-max-attempts=3",
    "app.auth.password-reset.reset-ip-window=PT1H"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class PasswordResetRateLimitIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private CountryRepository countryRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  @BeforeEach
  void setup() {
    Country country = countryRepository.findByIsoCode("HR")
        .orElseGet(() -> countryRepository.save(Country.builder().isoCode("HR")
            .countryName("Croatia").currencyCode("EUR").currencyName("Euro").build()));

    userRepository.save(UserEntity.builder().email("resetrl@test.com").name("Reset").surname("RL")
        .passwordHash(passwordEncoder.encode("Pass123!")).country(country)
        .dateOfRegister(Instant.now()).role(Role.USER).build());
  }

  @Test
  @DisplayName("Password forgot rate limits by IP after configured attempts")
  void forgotRateLimitedByIp() throws Exception {
    for (int i = 0; i < 3; i++) {
      mockMvc
          .perform(post("/api/auth/password/forgot").header("X-Forwarded-For", "10.0.0.1")
              .contentType(MediaType.APPLICATION_JSON).content(
                  objectMapper.writeValueAsString(Map.of("email", "resetrl-ip" + i + "@test.com"))))
          .andExpect(status().isOk());
    }

    mockMvc
        .perform(post("/api/auth/password/forgot").header("X-Forwarded-For", "10.0.0.1")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("email", "resetrl-ip99@test.com"))))
        .andExpect(status().isTooManyRequests()).andExpect(header().exists("Retry-After"))
        .andExpect(jsonPath("$.success").value(false));
  }

  @Test
  @DisplayName("Password forgot rate limits by email after configured attempts")
  void forgotRateLimitedByEmail() throws Exception {
    String email = "resetrl-email-only@test.com";
    for (int i = 0; i < 2; i++) {
      mockMvc
          .perform(post("/api/auth/password/forgot").header("X-Forwarded-For", "10.0.0.2")
              .contentType(MediaType.APPLICATION_JSON)
              .content(objectMapper.writeValueAsString(Map.of("email", email))))
          .andExpect(status().isOk());
    }

    mockMvc
        .perform(post("/api/auth/password/forgot").header("X-Forwarded-For", "10.0.0.2")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("email", email))))
        .andExpect(status().isTooManyRequests()).andExpect(header().exists("Retry-After"));
  }

  @Test
  @DisplayName("Password reset submit rate limits by IP after configured attempts")
  void resetSubmitRateLimitedByIp() throws Exception {
    for (int i = 0; i < 3; i++) {
      mockMvc
          .perform(post("/api/auth/password/reset").header("X-Forwarded-For", "10.0.0.3")
              .contentType(MediaType.APPLICATION_JSON)
              .content(objectMapper.writeValueAsString(
                  Map.of("token", "fake-token-" + i, "newPassword", "NewPass123!"))))
          .andExpect(status().isBadRequest());
    }

    mockMvc
        .perform(post("/api/auth/password/reset").header("X-Forwarded-For", "10.0.0.3")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper
                .writeValueAsString(Map.of("token", "fake-token-x", "newPassword", "NewPass123!"))))
        .andExpect(status().isTooManyRequests()).andExpect(header().exists("Retry-After"));
  }
}
