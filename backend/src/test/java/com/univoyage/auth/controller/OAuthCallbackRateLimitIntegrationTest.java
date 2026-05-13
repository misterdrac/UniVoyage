package com.univoyage.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.auth.config.GoogleOAuthHttpConfiguration;
import com.univoyage.auth.oauth.GoogleIdTokenVerifier;

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
import org.springframework.test.web.client.ExpectedCount;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {"app.auth.google.client-id=test-google-client-id",
    "app.auth.google.client-secret=test-google-secret",
    "app.auth.google.redirect-uris=http://localhost:5173/auth/google/callback",
    "app.auth.oauth.callback-ip-max-attempts=2", "app.auth.oauth.callback-ip-window=PT1H"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class OAuthCallbackRateLimitIntegrationTest {

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
  @DisplayName("POST /api/auth/google/callback returns 429 after configured OAuth callback attempts per IP")
  void oauthCallbackRateLimitedByIp() throws Exception {
    mockGoogle.expect(ExpectedCount.times(2), MockRestRequestMatchers.requestTo(TOKEN_ENDPOINT))
        .andRespond(MockRestResponseCreators.withSuccess(
            "{\"access_token\":\"at\",\"id_token\":\"tok\",\"expires_in\":3600}",
            MediaType.APPLICATION_JSON));

    when(googleIdTokenVerifier.verify(eq("tok"), anyString())).thenAnswer(invocation -> {
      String nonce = invocation.getArgument(1);
      Instant now = Instant.now();
      return new Jwt("tok", now, now.plusSeconds(360), Map.of("alg", "none"), Map.of("sub",
          "rl-sub", "email", "oauth-rl@example.com", "email_verified", true, "nonce", nonce));
    });

    String state1 = fetchState();
    mockMvc
        .perform(post("/api/auth/google/callback").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("code", "c1", "state", state1))))
        .andExpect(status().isOk());

    String state2 = fetchState();
    mockMvc
        .perform(post("/api/auth/google/callback").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("code", "c2", "state", state2))))
        .andExpect(status().isOk());

    String state3 = fetchState();
    mockMvc
        .perform(post("/api/auth/google/callback").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("code", "c3", "state", state3))))
        .andExpect(status().isTooManyRequests()).andExpect(jsonPath("$.success").value(false))
        .andExpect(header().exists("Retry-After"));
  }

  private String fetchState() throws Exception {
    MvcResult redirectResult = mockMvc.perform(get("/api/auth/google"))
        .andExpect(status().isFound()).andReturn();
    String location = redirectResult.getResponse().getHeader("Location");
    MultiValueMap<String, String> params = UriComponentsBuilder.fromUriString(location).build()
        .getQueryParams();
    String state = params.getFirst("state");
    assertThat(state).isNotBlank();
    return state;
  }
}
