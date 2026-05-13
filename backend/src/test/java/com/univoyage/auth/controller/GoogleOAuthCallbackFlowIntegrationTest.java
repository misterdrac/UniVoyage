package com.univoyage.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.auth.config.GoogleOAuthHttpConfiguration;
import com.univoyage.auth.oauth.GoogleIdTokenVerifier;
import com.univoyage.auth.service.GoogleOAuthService;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.test.web.client.match.MockRestRequestMatchers;
import org.springframework.test.web.client.response.MockRestResponseCreators;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Instant;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end callback tests with mocked Google HTTP and mocked ID token verifier (no outbound
 * calls to Google JWKS).
 */
@SpringBootTest(properties = {"app.auth.google.client-id=test-google-client-id",
    "app.auth.google.client-secret=test-google-secret",
    "app.auth.google.redirect-uris=http://localhost:5173/auth/google/callback",
    "app.auth.oauth.callback-ip-max-attempts=100"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class GoogleOAuthCallbackFlowIntegrationTest {

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
  @DisplayName("POST /api/auth/google/callback completes login when Google token and ID token validate")
  void callback_success_withMockedGoogleHttp() throws Exception {
    expectTokenJson(
        "{\"access_token\":\"at\",\"id_token\":\"dummy-id-token\",\"expires_in\":3600}");

    when(googleIdTokenVerifier.verify(eq("dummy-id-token"), anyString())).thenAnswer(invocation -> {
      String nonce = invocation.getArgument(1);
      Instant now = Instant.now();
      return new Jwt("dummy-id-token", now, now.plusSeconds(360), Map.of("alg", "none"),
          Map.of("sub", "google-sub-oauth-flow", "email", "oauth-flow-user@example.com",
              "email_verified", true, "nonce", nonce));
    });

    String state = fetchStateFromAuthorizeRedirect();

    mockMvc
        .perform(post("/api/auth/google/callback").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(
                Map.of("code", "google-auth-code", "state", state))))
        .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.success").value(true))
        .andExpect(jsonPath("$.data.user.email").value("oauth-flow-user@example.com"));
  }

  @Test
  @DisplayName("POST /api/auth/google/callback returns 400 when OAuth state is tampered")
  void callback_tamperedState_returns400() throws Exception {
    String state = fetchStateFromAuthorizeRedirect();
    String badState = state.endsWith("z") ? state.substring(0, state.length() - 1) + "0"
        : state + "x";

    mockMvc
        .perform(post("/api/auth/google/callback").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("code", "code", "state", badState))))
        .andExpect(status().isBadRequest()).andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.error").value(GoogleOAuthService.ERROR_INVALID_STATE));
  }

  @Test
  @DisplayName("POST /api/auth/google/callback returns 401 when Google omits id_token")
  void callback_missingIdToken_returns401() throws Exception {
    expectTokenJson("{\"access_token\":\"at\",\"expires_in\":3600}");

    String state = fetchStateFromAuthorizeRedirect();

    mockMvc
        .perform(post("/api/auth/google/callback").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("code", "code", "state", state))))
        .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.error").value("Google token response missing id_token"));
  }

  @Test
  @DisplayName("POST /api/auth/google/callback returns 401 when email is not verified and policy requires it")
  void callback_unverifiedEmail_returns401() throws Exception {
    expectTokenJson(
        "{\"access_token\":\"at\",\"id_token\":\"dummy-id-token\",\"expires_in\":3600}");

    when(googleIdTokenVerifier.verify(eq("dummy-id-token"), anyString())).thenAnswer(invocation -> {
      String nonce = invocation.getArgument(1);
      Instant now = Instant.now();
      return new Jwt("dummy-id-token", now, now.plusSeconds(360), Map.of("alg", "none"),
          Map.of("sub", "sub", "email", "unverified@example.com", "email_verified", false, "nonce",
              nonce));
    });

    String state = fetchStateFromAuthorizeRedirect();

    mockMvc
        .perform(post("/api/auth/google/callback").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("code", "code", "state", state))))
        .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.error").value(GoogleOAuthService.ERROR_EMAIL_UNVERIFIED));
  }

  @Test
  @DisplayName("POST /api/auth/google/callback returns 401 when ID token verification fails")
  void callback_idTokenVerifierThrows_returns401() throws Exception {
    expectTokenJson(
        "{\"access_token\":\"at\",\"id_token\":\"bad-token\",\"expires_in\":3600}");

    when(googleIdTokenVerifier.verify(eq("bad-token"), anyString()))
        .thenThrow(new IllegalArgumentException("wrong audience"));

    String state = fetchStateFromAuthorizeRedirect();

    mockMvc
        .perform(post("/api/auth/google/callback").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("code", "code", "state", state))))
        .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.error").value("wrong audience"));
  }

  private void expectTokenJson(String json) {
    mockGoogle.expect(MockRestRequestMatchers.requestTo(TOKEN_ENDPOINT)).andRespond(
        MockRestResponseCreators.withSuccess(json, MediaType.APPLICATION_JSON));
  }

  private String fetchStateFromAuthorizeRedirect() throws Exception {
    MvcResult redirectResult =
        mockMvc.perform(get("/api/auth/google")).andExpect(status().isFound()).andReturn();
    String location = redirectResult.getResponse().getHeader("Location");
    assertThat(location).isNotBlank();
    MultiValueMap<String, String> params =
        UriComponentsBuilder.fromUriString(location).build().getQueryParams();
    String state = params.getFirst("state");
    assertThat(state).isNotBlank();
    return state;
  }
}
