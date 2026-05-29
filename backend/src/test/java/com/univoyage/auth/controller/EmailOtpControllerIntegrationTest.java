package com.univoyage.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.auth.otp.EmailOtpPurpose;
import com.univoyage.auth.otp.TestOtpNotificationPort;
import com.univoyage.reference.country.model.Country;
import com.univoyage.reference.country.repository.CountryRepository;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;

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

import java.time.Instant;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {"app.auth.otp.auto-register-on-verify=true",
    "app.auth.otp.auto-register-country-code=MT"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class EmailOtpControllerIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private TestOtpNotificationPort testOtpNotificationPort;

  @Autowired
  private CountryRepository countryRepository;

  @Autowired
  private UserRepository userRepository;

  @BeforeEach
  void seed() {
    testOtpNotificationPort.clear();
    if (countryRepository.findByIsoCode("MT").isEmpty()) {
      countryRepository.save(Country.builder().isoCode("MT").countryName("Malta")
          .currencyCode("EUR").currencyName("Euro").build());
    }
  }

  @Test
  @DisplayName("request returns 200 for unknown and known emails with same body shape")
  void requestDoesNotEnumerateEmail() throws Exception {
    userRepository.save(UserEntity.builder().email("known@example.com").name("K").surname("U")
        .passwordHash("{noop}x").country(countryRepository.findByIsoCode("MT").orElseThrow())
        .dateOfRegister(Instant.now()).role(com.univoyage.user.model.Role.USER).build());

    String knownBody = objectMapper.writeValueAsString(
        Map.of("email", "known@example.com", "purpose", EmailOtpPurpose.LOGIN.name()));
    String unknownBody = objectMapper.writeValueAsString(
        Map.of("email", "unknown@example.com", "purpose", EmailOtpPurpose.LOGIN.name()));

    mockMvc
        .perform(post("/api/auth/otp/request").contentType(MediaType.APPLICATION_JSON)
            .content(knownBody))
        .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.message").exists());

    mockMvc
        .perform(post("/api/auth/otp/request").contentType(MediaType.APPLICATION_JSON)
            .content(unknownBody))
        .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.message").exists());
  }

  @Test
  @DisplayName("verify wrong code returns 400 with generic message")
  void verifyWrongCodeGenericError() throws Exception {
    String request = objectMapper.writeValueAsString(
        Map.of("email", "wrong@example.com", "purpose", EmailOtpPurpose.LOGIN.name()));
    mockMvc
        .perform(
            post("/api/auth/otp/request").contentType(MediaType.APPLICATION_JSON).content(request))
        .andExpect(status().isOk());

    String verify = objectMapper.writeValueAsString(Map.of("email", "wrong@example.com", "purpose",
        EmailOtpPurpose.LOGIN.name(), "code", "000000"));

    mockMvc
        .perform(
            post("/api/auth/otp/verify").contentType(MediaType.APPLICATION_JSON).content(verify))
        .andExpect(status().isBadRequest()).andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.error").value("Invalid or expired verification code."));
  }

  @Test
  @DisplayName("happy path request + verify returns auth payload")
  void happyPathVerify() throws Exception {
    String email = "happy@example.com";
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
        .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.user.email").value(email));
  }
}
