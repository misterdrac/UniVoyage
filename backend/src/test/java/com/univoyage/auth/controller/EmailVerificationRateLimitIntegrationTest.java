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

@SpringBootTest(properties = {"app.auth.email-verification.request-ip-max-attempts=3",
    "app.auth.email-verification.request-ip-window=PT1H",
    "app.auth.email-verification.request-email-max-attempts=2",
    "app.auth.email-verification.request-email-window=PT1H",
    "app.auth.email-verification.confirm-ip-max-attempts=3",
    "app.auth.email-verification.confirm-ip-window=PT1H"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class EmailVerificationRateLimitIntegrationTest {

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
    Country country = countryRepository.findByIsoCode("BA")
        .orElseGet(() -> countryRepository
            .save(Country.builder().isoCode("BA").countryName("Bosnia and Herzegovina")
                .currencyCode("BAM").currencyName("Convertible Mark").build()));

    userRepository.save(UserEntity.builder().email("verifyrl@test.com").name("Verify").surname("RL")
        .passwordHash(passwordEncoder.encode("Pass123!")).country(country)
        .dateOfRegister(Instant.now()).role(Role.USER).build());
  }

  @Test
  @DisplayName("Email verification request rate limits by IP")
  void requestRateLimitedByIp() throws Exception {
    for (int i = 0; i < 3; i++) {
      mockMvc
          .perform(post("/api/auth/email/verification/request")
              .header("X-Forwarded-For", "10.1.0.1").contentType(MediaType.APPLICATION_JSON)
              .content(objectMapper
                  .writeValueAsString(Map.of("email", "verifyrl-ip" + i + "@test.com"))))
          .andExpect(status().isOk());
    }

    mockMvc
        .perform(post("/api/auth/email/verification/request").header("X-Forwarded-For", "10.1.0.1")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("email", "verifyrl-ip99@test.com"))))
        .andExpect(status().isTooManyRequests()).andExpect(header().exists("Retry-After"))
        .andExpect(jsonPath("$.success").value(false));
  }

  @Test
  @DisplayName("Email verification request rate limits by email")
  void requestRateLimitedByEmail() throws Exception {
    String email = "verifyrl-email-only@test.com";
    for (int i = 0; i < 2; i++) {
      mockMvc
          .perform(post("/api/auth/email/verification/request")
              .header("X-Forwarded-For", "10.1.0.2").contentType(MediaType.APPLICATION_JSON)
              .content(objectMapper.writeValueAsString(Map.of("email", email))))
          .andExpect(status().isOk());
    }

    mockMvc
        .perform(post("/api/auth/email/verification/request").header("X-Forwarded-For", "10.1.0.2")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("email", email))))
        .andExpect(status().isTooManyRequests()).andExpect(header().exists("Retry-After"));
  }

  @Test
  @DisplayName("Email verification confirm rate limits by IP")
  void confirmRateLimitedByIp() throws Exception {
    for (int i = 0; i < 3; i++) {
      mockMvc
          .perform(post("/api/auth/email/verification/confirm")
              .header("X-Forwarded-For", "10.1.0.3").contentType(MediaType.APPLICATION_JSON)
              .content(objectMapper.writeValueAsString(Map.of("token", "fake-token-" + i))))
          .andExpect(status().isBadRequest());
    }

    mockMvc
        .perform(post("/api/auth/email/verification/confirm").header("X-Forwarded-For", "10.1.0.3")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("token", "fake-token-x"))))
        .andExpect(status().isTooManyRequests()).andExpect(header().exists("Retry-After"));
  }
}
