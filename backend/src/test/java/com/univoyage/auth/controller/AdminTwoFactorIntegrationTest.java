package com.univoyage.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.auth.otp.EmailOtpPurpose;
import com.univoyage.auth.otp.TestOtpNotificationPort;
import com.univoyage.auth.security.JwtService;
import com.univoyage.reference.country.model.Country;
import com.univoyage.reference.country.repository.CountryRepository;
import com.univoyage.user.model.Role;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;
import jakarta.servlet.http.Cookie;
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
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {"app.auth.admin-2fa.challenge-email-max-attempts=50",
    "app.auth.admin-2fa.challenge-ip-max-attempts=50",
    "app.auth.admin-2fa.verify-email-max-attempts=50",
    "app.auth.admin-2fa.verify-ip-max-attempts=50"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AdminTwoFactorIntegrationTest {

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

  @Autowired
  private JwtService jwtService;

  @Autowired
  private PasswordEncoder passwordEncoder;

  private UserEntity adminUser;
  private UserEntity regularUser;

  @BeforeEach
  void setup() {
    testOtpNotificationPort.clear();
    Country country = countryRepository.findByIsoCode("MT")
        .orElseGet(() -> countryRepository.save(Country.builder().isoCode("MT").countryName("Malta")
            .currencyCode("EUR").currencyName("Euro").build()));

    adminUser = userRepository.save(UserEntity.builder().email("admin@test.com").name("Admin")
        .surname("User").passwordHash(passwordEncoder.encode("Admin123!")).country(country)
        .dateOfRegister(Instant.now()).role(Role.ADMIN).build());

    regularUser = userRepository.save(UserEntity.builder().email("user@test.com").name("Regular")
        .surname("User").passwordHash(passwordEncoder.encode("User123!")).country(country)
        .dateOfRegister(Instant.now()).role(Role.USER).build());
  }

  private Cookie adminJwtCookie() {
    JwtService.TokenPair pair = jwtService.generateForUser(adminUser);
    return new Cookie("auth_token", pair.jwt());
  }

  private Cookie adminJwtCookieWithTfa() {
    JwtService.TokenPair pair = jwtService.generateForUserWithTwoFactor(adminUser);
    return new Cookie("auth_token", pair.jwt());
  }

  private Cookie userJwtCookie() {
    JwtService.TokenPair pair = jwtService.generateForUser(regularUser);
    return new Cookie("auth_token", pair.jwt());
  }

  @Test
  @DisplayName("GET /me exposes twoFactorVerified from JWT tfa claim")
  void meReportsTwoFactorVerified() throws Exception {
    mockMvc.perform(get("/api/auth/me").cookie(adminJwtCookie())).andExpect(status().isOk())
        .andExpect(jsonPath("$.data.twoFactorVerified").value(false));

    mockMvc.perform(get("/api/auth/me").cookie(adminJwtCookieWithTfa())).andExpect(status().isOk())
        .andExpect(jsonPath("$.data.twoFactorVerified").value(true));
  }

  @Test
  @DisplayName("Admin without 2FA gets 403 on CMS endpoints")
  void adminWithout2faBlockedFromCms() throws Exception {
    mockMvc.perform(get("/api/admin/users").cookie(adminJwtCookie()))
        .andExpect(status().isForbidden()).andExpect(jsonPath("$.error")
            .value("Two-factor authentication required. Please complete 2FA verification."));
  }

  @Test
  @DisplayName("Admin with 2FA can access CMS endpoints")
  void adminWith2faCanAccessCms() throws Exception {
    mockMvc.perform(get("/api/admin/users").cookie(adminJwtCookieWithTfa()))
        .andExpect(status().isOk());
  }

  @Test
  @DisplayName("Regular user cannot call 2FA challenge endpoint")
  void regularUserCannotChallenge() throws Exception {
    mockMvc.perform(post("/api/auth/2fa/challenge").cookie(userJwtCookie())
        .contentType(MediaType.APPLICATION_JSON)).andExpect(status().isForbidden());
  }

  @Test
  @DisplayName("Admin can request 2FA challenge and receives OTP")
  void adminCanRequestChallenge() throws Exception {
    JwtService.TokenPair pair = jwtService.generateForUser(adminUser);
    Cookie jwtCookie = new Cookie("auth_token", pair.jwt());

    mockMvc
        .perform(post("/api/auth/2fa/challenge").cookie(jwtCookie)
            .header("X-CSRF-TOKEN", pair.csrfSecret()).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.message").value("Verification code sent to your email."));

    String code = testOtpNotificationPort.lastCode("admin@test.com", EmailOtpPurpose.ADMIN_LOGIN);
    assert code != null && code.length() == 6;
  }

  @Test
  @DisplayName("Admin 2FA full flow: challenge -> verify -> access CMS")
  void fullTwoFactorFlow() throws Exception {
    JwtService.TokenPair pair = jwtService.generateForUser(adminUser);
    Cookie jwtCookie = new Cookie("auth_token", pair.jwt());
    String csrf = pair.csrfSecret();

    mockMvc.perform(post("/api/auth/2fa/challenge").cookie(jwtCookie).header("X-CSRF-TOKEN", csrf)
        .contentType(MediaType.APPLICATION_JSON)).andExpect(status().isOk());

    String code = testOtpNotificationPort.lastCode("admin@test.com", EmailOtpPurpose.ADMIN_LOGIN);

    MvcResult verifyResult = mockMvc
        .perform(post("/api/auth/2fa/verify").cookie(jwtCookie).header("X-CSRF-TOKEN", csrf)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("code", code))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.message").value("Two-factor authentication verified."))
        .andReturn();

    Cookie newJwtCookie = verifyResult.getResponse().getCookie("auth_token");
    assert newJwtCookie != null;

    mockMvc.perform(get("/api/admin/users").cookie(newJwtCookie)).andExpect(status().isOk());
  }

  @Test
  @DisplayName("Wrong 2FA code returns 400 with remaining attempts")
  void wrongCodeReturns400() throws Exception {
    JwtService.TokenPair pair = jwtService.generateForUser(adminUser);
    Cookie jwtCookie = new Cookie("auth_token", pair.jwt());
    String csrf = pair.csrfSecret();

    mockMvc.perform(post("/api/auth/2fa/challenge").cookie(jwtCookie).header("X-CSRF-TOKEN", csrf)
        .contentType(MediaType.APPLICATION_JSON)).andExpect(status().isOk());

    mockMvc
        .perform(post("/api/auth/2fa/verify").cookie(jwtCookie).header("X-CSRF-TOKEN", csrf)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("code", "000000"))))
        .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error")
            .value(org.hamcrest.Matchers.containsString("Invalid verification code")));
  }

  @Test
  @DisplayName("5 wrong codes locks the challenge and returns 429")
  void lockoutAfterMaxAttempts() throws Exception {
    JwtService.TokenPair pair = jwtService.generateForUser(adminUser);
    Cookie jwtCookie = new Cookie("auth_token", pair.jwt());
    String csrf = pair.csrfSecret();

    mockMvc.perform(post("/api/auth/2fa/challenge").cookie(jwtCookie).header("X-CSRF-TOKEN", csrf)
        .contentType(MediaType.APPLICATION_JSON)).andExpect(status().isOk());

    for (int i = 0; i < 5; i++) {
      mockMvc.perform(post("/api/auth/2fa/verify").cookie(jwtCookie).header("X-CSRF-TOKEN", csrf)
          .contentType(MediaType.APPLICATION_JSON)
          .content(objectMapper.writeValueAsString(Map.of("code", "00000" + i))));
    }

    mockMvc
        .perform(post("/api/auth/2fa/verify").cookie(jwtCookie).header("X-CSRF-TOKEN", csrf)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("code", "999999"))))
        .andExpect(status().isTooManyRequests());
  }
}
