package com.univoyage.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.auth.config.GoogleOAuthHttpConfiguration;
import com.univoyage.auth.oauth.GoogleIdTokenVerifier;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.test.web.client.match.MockRestRequestMatchers;
import org.springframework.test.web.client.response.MockRestResponseCreators;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Map;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Legacy SPA path: {@code POST} body {@code {code}} only with
 * {@code app.auth.oauth.require-signed-oauth-state=false}.
 */
@SpringBootTest(properties = {"app.auth.google.client-id=test-google-client-id",
    "app.auth.google.client-secret=test-google-secret",
    "app.auth.google.redirect-uris=http://localhost:5173/auth/google/callback",
    "app.auth.oauth.callback-ip-max-attempts=100",
    "app.auth.oauth.require-signed-oauth-state=false"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class GoogleOAuthLegacyCallbackIntegrationTest {

  private static final String TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  @Qualifier(GoogleOAuthHttpConfiguration.GOOGLE_OAUTH_REST_TEMPLATE)
  private RestTemplate googleOAuthRestTemplate;

  @MockBean
  private GoogleIdTokenVerifier googleIdTokenVerifier;

  private MockRestServiceServer mockGoogle;

  @BeforeEach
  void bindGoogleHttpMock() {
    mockGoogle = MockRestServiceServer.bindTo(googleOAuthRestTemplate).build();
  }

  @AfterEach
  void verifyGoogleHttpMock() {
    mockGoogle.verify();
  }

  @Test
  @DisplayName("Legacy mode: authorize URL has no OIDC nonce; POST callback succeeds with code only")
  void legacyFlow_codeOnlyPost() throws Exception {
    mockMvc.perform(get("/api/auth/google")).andExpect(status().isFound()).andExpect(
        header().string(HttpHeaders.LOCATION, Matchers.not(Matchers.containsString("nonce="))));

    mockGoogle.expect(MockRestRequestMatchers.requestTo(TOKEN_ENDPOINT)).andRespond(
        MockRestResponseCreators.withSuccess(
            "{\"access_token\":\"at\",\"id_token\":\"dummy-id-token\",\"expires_in\":3600}",
            MediaType.APPLICATION_JSON));

    when(googleIdTokenVerifier.verify(eq("dummy-id-token"), isNull())).thenAnswer(invocation -> {
      Instant now = Instant.now();
      return new Jwt("dummy-id-token", now, now.plusSeconds(360), Map.of("alg", "none"),
          Map.of("sub", "legacy-sub", "email", "legacy-oauth@example.com", "email_verified", true));
    });

    mockMvc
        .perform(post("/api/auth/google/callback").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("code", "google-auth-code"))))
        .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.user.email").value("legacy-oauth@example.com"));
  }

  @Test
  @DisplayName("Legacy mode: POST without state field succeeds")
  void legacyFlow_jsonWithoutStateField() throws Exception {
    mockGoogle.expect(MockRestRequestMatchers.requestTo(TOKEN_ENDPOINT)).andRespond(
        MockRestResponseCreators.withSuccess(
            "{\"access_token\":\"at\",\"id_token\":\"dummy-id-token\",\"expires_in\":3600}",
            MediaType.APPLICATION_JSON));

    when(googleIdTokenVerifier.verify(eq("dummy-id-token"), isNull())).thenAnswer(invocation -> {
      Instant now = Instant.now();
      return new Jwt("dummy-id-token", now, now.plusSeconds(360), Map.of("alg", "none"),
          Map.of("sub", "legacy-sub2", "email", "legacy-oauth2@example.com", "email_verified", true));
    });

    mockMvc
        .perform(post("/api/auth/google/callback").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("code", "c"))))
        .andExpect(status().isOk());
  }
}
