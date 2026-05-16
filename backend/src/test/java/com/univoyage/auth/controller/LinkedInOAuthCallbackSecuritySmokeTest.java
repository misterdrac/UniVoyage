package com.univoyage.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.auth.config.LinkedInOAuthHttpConfiguration;
import com.univoyage.auth.security.CookieUtils;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full-stack smoke: real
 * {@link org.springframework.security.web.SecurityFilterChain} and
 * {@link LinkedInOAuthController} with mocked LinkedIn HTTP only.
 */
@SpringBootTest(properties = {"app.auth.linkedin.client-id=test-linkedin-client",
    "app.auth.linkedin.client-secret=test-linkedin-secret",
    "app.auth.linkedin.redirect-uris=http://localhost:5173/auth/linkedin/callback",
    "app.auth.oauth.callback-ip-max-attempts=100"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class LinkedInOAuthCallbackSecuritySmokeTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  @Qualifier(LinkedInOAuthHttpConfiguration.LINKEDIN_OAUTH_REST_TEMPLATE)
  private RestTemplate linkedinOAuthRestTemplate;

  private MockRestServiceServer mockLinkedIn;

  @BeforeEach
  void bindMock() {
    mockLinkedIn = MockRestServiceServer.bindTo(linkedinOAuthRestTemplate).build();
  }

  @AfterEach
  void verifyMock() {
    mockLinkedIn.verify();
  }

  @Test
  @DisplayName("LinkedIn callback is permitAll and sets same auth cookies as Google")
  void linkedInCallback_fullHttp_setsSessionCookies() throws Exception {
    mockLinkedIn
        .expect(MockRestRequestMatchers.requestTo("https://www.linkedin.com/oauth/v2/accessToken"))
        .andRespond(MockRestResponseCreators.withSuccess("{\"access_token\":\"li-at\"}",
            MediaType.APPLICATION_JSON));
    mockLinkedIn.expect(MockRestRequestMatchers.requestTo("https://api.linkedin.com/v2/userinfo"))
        .andRespond(MockRestResponseCreators.withSuccess(
            "{\"sub\":\"smoke-sub\",\"email\":\"smoke@example.com\",\"email_verified\":true}",
            MediaType.APPLICATION_JSON));

    MvcResult redirect = mockMvc.perform(get("/api/auth/linkedin")).andExpect(status().isFound())
        .andReturn();
    String state = UriComponentsBuilder.fromUriString(redirect.getResponse().getHeader("Location"))
        .build().getQueryParams().getFirst("state");

    MvcResult result = mockMvc
        .perform(post("/api/auth/linkedin/callback").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("code", "smoke-code", "state", state))))
        .andExpect(status().isOk()).andReturn();

    List<String> cookies = result.getResponse().getHeaders(HttpHeaders.SET_COOKIE);
    assertThat(cookies).isNotEmpty();
    assertThat(cookies.stream().anyMatch(c -> c.startsWith(CookieUtils.JWT_COOKIE_NAME + "=")))
        .isTrue();
    assertThat(cookies.stream().anyMatch(c -> c.startsWith(CookieUtils.CSRF_COOKIE_NAME + "=")))
        .isTrue();
    assertThat(
        cookies.stream().anyMatch(c -> c.startsWith(CookieUtils.REFRESH_TOKEN_COOKIE_NAME + "=")))
        .isTrue();
  }
}
