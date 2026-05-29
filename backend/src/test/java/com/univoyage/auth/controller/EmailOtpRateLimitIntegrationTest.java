package com.univoyage.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.auth.otp.EmailOtpPurpose;
import com.univoyage.auth.otp.TestOtpNotificationPort;
import com.univoyage.reference.country.model.Country;
import com.univoyage.reference.country.repository.CountryRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {"app.auth.otp.request-ip-max-attempts=3",
    "app.auth.otp.request-ip-window=PT1H", "app.auth.otp.verify-ip-max-attempts=5",
    "app.auth.otp.verify-ip-window=PT1H", "app.auth.otp.max-verify-attempts-per-challenge=2",
    "app.auth.otp.resend-cooldown=PT0S", "app.auth.otp.auto-register-on-verify=true",
    "app.auth.otp.auto-register-country-code=MT"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class EmailOtpRateLimitIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private TestOtpNotificationPort testOtpNotificationPort;

  @Autowired
  private CountryRepository countryRepository;

  @BeforeEach
  void seed() {
    testOtpNotificationPort.clear();
    if (countryRepository.findByIsoCode("MT").isEmpty()) {
      countryRepository.save(Country.builder().isoCode("MT").countryName("Malta")
          .currencyCode("EUR").currencyName("Euro").build());
    }
  }

  @Test
  @DisplayName("request rate limited per IP after configured max")
  void requestRateLimitedByIp() throws Exception {
    String body = objectMapper.writeValueAsString(
        Map.of("email", "rate@example.com", "purpose", EmailOtpPurpose.LOGIN.name()));

    for (int i = 0; i < 3; i++) {
      mockMvc.perform(post("/api/auth/otp/request").header("X-Forwarded-For", "198.51.100.1")
          .contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isOk());
    }

    mockMvc
        .perform(post("/api/auth/otp/request").header("X-Forwarded-For", "198.51.100.1")
            .contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isTooManyRequests()).andExpect(header().exists("Retry-After"))
        .andExpect(jsonPath("$.error").value("Too many attempts. Please try again later."));
  }

  @Test
  @DisplayName("same IP different emails: request limit is per IP so shared bucket")
  void sameIpDifferentEmailsShareIpBucket() throws Exception {
    for (int i = 0; i < 3; i++) {
      String email = "user" + i + "@example.com";
      mockMvc
          .perform(post("/api/auth/otp/request").header("X-Forwarded-For", "203.0.113.50")
              .contentType(MediaType.APPLICATION_JSON)
              .content(objectMapper.writeValueAsString(
                  Map.of("email", email, "purpose", EmailOtpPurpose.LOGIN.name()))))
          .andExpect(status().isOk());
    }

    mockMvc
        .perform(post("/api/auth/otp/request").header("X-Forwarded-For", "203.0.113.50")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(
                Map.of("email", "another@example.com", "purpose", EmailOtpPurpose.LOGIN.name()))))
        .andExpect(status().isTooManyRequests());
  }

  @Test
  @DisplayName("wrong verify attempts lock challenge then return 400/429")
  void verifyAttemptsLockChallenge() throws Exception {
    String email = "lock@example.com";
    mockMvc
        .perform(post("/api/auth/otp/request").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(
                Map.of("email", email, "purpose", EmailOtpPurpose.REGISTER.name()))))
        .andExpect(status().isOk());

    String verifyBody = objectMapper.writeValueAsString(
        Map.of("email", email, "purpose", EmailOtpPurpose.REGISTER.name(), "code", "000000"));

    mockMvc.perform(
        post("/api/auth/otp/verify").contentType(MediaType.APPLICATION_JSON).content(verifyBody))
        .andExpect(status().isBadRequest());

    mockMvc
        .perform(post("/api/auth/otp/verify").contentType(MediaType.APPLICATION_JSON)
            .content(verifyBody))
        .andExpect(status().isTooManyRequests()).andExpect(header().exists("Retry-After"));

    String code = testOtpNotificationPort.lastCode(email, EmailOtpPurpose.REGISTER);
    mockMvc
        .perform(post("/api/auth/otp/verify").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(
                Map.of("email", email, "purpose", EmailOtpPurpose.REGISTER.name(), "code", code))))
        .andExpect(status().isTooManyRequests());
  }

  @Test
  @DisplayName("happy path still works under normal limits")
  void happyPathUnderNormalUse() throws Exception {
    String email = "normal@example.com";
    mockMvc
        .perform(post("/api/auth/otp/request").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(
                Map.of("email", email, "purpose", EmailOtpPurpose.REGISTER.name()))))
        .andExpect(status().isOk());

    String code = testOtpNotificationPort.lastCode(email, EmailOtpPurpose.REGISTER);
    mockMvc
        .perform(post("/api/auth/otp/verify").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(
                Map.of("email", email, "purpose", EmailOtpPurpose.REGISTER.name(), "code", code))))
        .andExpect(status().isOk()).andExpect(jsonPath("$.data.token").exists());
  }
}
