package com.univoyage.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.auth.security.CookieUtils;
import com.univoyage.auth.security.JwtService;
import com.univoyage.reference.country.model.Country;
import com.univoyage.reference.country.repository.CountryRepository;
import com.univoyage.user.model.Role;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;
import jakarta.servlet.http.Cookie;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthRefreshTokenIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private CountryRepository countryRepository;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private JwtService jwtService;

  @Autowired
  private PasswordEncoder passwordEncoder;

  @Test
  @DisplayName("POST /api/auth/refresh returns 401 without refresh cookie")
  void refresh_missingCookie_returns401() throws Exception {
    mockMvc.perform(post("/api/auth/refresh")).andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.success").value(false));
  }

  @Test
  @DisplayName("After login, POST /api/auth/refresh issues new access and rotates refresh token")
  void refresh_afterLogin_rotatesAndUpdatesCookies() throws Exception {
    seedCountry("LU", "Luxembourg");

    mockMvc
        .perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("email", "refresh-flow@example.com",
                "password", "Str0ng!Pass", "name", "R", "surname", "F", "countryCode", "LU"))))
        .andExpect(status().isCreated());

    MvcResult loginResult = mockMvc
        .perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(
                Map.of("email", "refresh-flow@example.com", "password", "Str0ng!Pass"))))
        .andExpect(status().isOk()).andReturn();

    Cookie refreshCookie = loginResult.getResponse()
        .getCookie(CookieUtils.REFRESH_TOKEN_COOKIE_NAME);
    assertThat(refreshCookie).isNotNull();
    assertThat(refreshCookie.getValue()).isNotBlank();

    MvcResult refreshResult = mockMvc.perform(post("/api/auth/refresh").cookie(refreshCookie))
        .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.token").exists())
        .andExpect(jsonPath("$.data.csrfToken").exists()).andReturn();

    Cookie newRefresh = refreshResult.getResponse()
        .getCookie(CookieUtils.REFRESH_TOKEN_COOKIE_NAME);
    assertThat(newRefresh).isNotNull();
    assertThat(newRefresh.getValue()).isNotBlank();
    assertThat(newRefresh.getValue()).isNotEqualTo(refreshCookie.getValue());

    mockMvc.perform(post("/api/auth/refresh").cookie(refreshCookie))
        .andExpect(status().isUnauthorized());
  }

  @Test
  @DisplayName("Logout with JWT session revokes refresh tokens so subsequent refresh fails")
  void logout_revokesRefreshTokens() throws Exception {
    seedCountry("MC", "Monaco");

    mockMvc
        .perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("email", "logout-refresh@example.com",
                "password", "Str0ng!Pass", "name", "L", "surname", "R", "countryCode", "MC"))))
        .andExpect(status().isCreated());

    MvcResult loginResult = mockMvc
        .perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(
                Map.of("email", "logout-refresh@example.com", "password", "Str0ng!Pass"))))
        .andExpect(status().isOk()).andReturn();

    Cookie jwt = loginResult.getResponse().getCookie(CookieUtils.JWT_COOKIE_NAME);
    Cookie csrf = loginResult.getResponse().getCookie(CookieUtils.CSRF_COOKIE_NAME);
    Cookie refreshCookie = loginResult.getResponse()
        .getCookie(CookieUtils.REFRESH_TOKEN_COOKIE_NAME);
    assertThat(jwt).isNotNull();
    assertThat(csrf).isNotNull();
    assertThat(refreshCookie).isNotNull();

    mockMvc.perform(post("/api/auth/logout").cookie(jwt, csrf, refreshCookie).header("X-CSRF-TOKEN",
        csrf.getValue())).andExpect(status().isOk());

    mockMvc.perform(post("/api/auth/refresh").cookie(refreshCookie))
        .andExpect(status().isUnauthorized());
  }

  @Test
  @DisplayName("POST /api/auth/refresh preserves admin two-factor claim from prior access JWT")
  void refresh_preservesTwoFactorClaimFromAccessCookie() throws Exception {
    Country country = seedCountry("AD", "Andorra");
    String password = "Str0ng!Pass";
    userRepository.save(UserEntity.builder().email("tfa-refresh-admin@example.com").name("A")
        .surname("D").passwordHash(passwordEncoder.encode(password)).country(country)
        .dateOfRegister(Instant.now()).role(Role.ADMIN).build());

    MvcResult loginResult = mockMvc
        .perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(
                Map.of("email", "tfa-refresh-admin@example.com", "password", password))))
        .andExpect(status().isOk()).andReturn();

    Cookie refreshCookie = loginResult.getResponse()
        .getCookie(CookieUtils.REFRESH_TOKEN_COOKIE_NAME);
    assertThat(refreshCookie).isNotNull();

    JwtService.TokenPair tfaPair = jwtService.generateForUserWithTwoFactor(
        userRepository.findByEmail("tfa-refresh-admin@example.com").orElseThrow());
    assertThat(jwtService.extractTwoFactorVerified(tfaPair.jwt())).isTrue();
    assertThat(jwtService.extractTwoFactorVerifiedAllowExpired(tfaPair.jwt())).isTrue();
    Cookie tfaJwtCookie = new Cookie(CookieUtils.JWT_COOKIE_NAME, tfaPair.jwt());

    MvcResult refreshResult = mockMvc
        .perform(post("/api/auth/refresh").cookie(refreshCookie, tfaJwtCookie))
        .andExpect(status().isOk()).andReturn();

    Cookie newJwt = refreshResult.getResponse().getCookie(CookieUtils.JWT_COOKIE_NAME);
    assertThat(newJwt).isNotNull();
    assertThat(jwtService.extractTwoFactorVerified(newJwt.getValue())).isTrue();
  }

  private Country seedCountry(String iso, String name) {
    return countryRepository.save(Country.builder().isoCode(iso).countryName(name)
        .currencyCode("EUR").currencyName("Euro").build());
  }
}
