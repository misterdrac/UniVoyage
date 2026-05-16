package com.univoyage.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.auth.config.LinkedInOAuthHttpConfiguration;
import com.univoyage.auth.model.UserIdentity;
import com.univoyage.auth.repository.UserIdentityRepository;
import com.univoyage.auth.service.LinkedInOAuthService;
import com.univoyage.user.model.Role;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
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

import java.time.Instant;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {"app.auth.linkedin.client-id=test-linkedin-client",
    "app.auth.linkedin.client-secret=test-linkedin-secret",
    "app.auth.linkedin.redirect-uris=http://localhost:5173/auth/linkedin/callback",
    "app.auth.oauth.callback-ip-max-attempts=100"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class LinkedInOAuthCallbackFlowIntegrationTest {

  private static final String TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
  private static final String USERINFO_URL = "https://api.linkedin.com/v2/userinfo";

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private UserIdentityRepository userIdentityRepository;

  @Autowired
  private UserRepository userRepository;

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
  @DisplayName("happy path: token + userinfo creates linkedin identity")
  void callback_success() throws Exception {
    mockLinkedIn.expect(MockRestRequestMatchers.requestTo(TOKEN_URL))
        .andRespond(MockRestResponseCreators.withSuccess("{\"access_token\":\"li-at\"}",
            MediaType.APPLICATION_JSON));
    mockLinkedIn.expect(MockRestRequestMatchers.requestTo(USERINFO_URL))
        .andRespond(MockRestResponseCreators.withSuccess(
            "{\"sub\":\"li-sub-42\",\"email\":\"linkedin-flow@example.com\",\"email_verified\":true,\"given_name\":\"Li\",\"family_name\":\"User\"}",
            MediaType.APPLICATION_JSON));

    String state = fetchState();

    mockMvc
        .perform(post("/api/auth/linkedin/callback").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("code", "li-code", "state", state))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.user.email").value("linkedin-flow@example.com"));

    assertThat(userIdentityRepository.findByProviderAndProviderSubject("linkedin", "li-sub-42"))
        .isPresent();
  }

  @Test
  @DisplayName("returning user succeeds when userinfo omits email but identity exists")
  void callback_returningUser_withoutEmailInUserinfo() throws Exception {
    UserEntity existing = userRepository.save(UserEntity.builder().email("returning-li@example.com")
        .name("L").surname("I").passwordHash("{noop}x").dateOfRegister(Instant.now())
        .dateOfLastSignin(Instant.now()).role(Role.USER).build());
    userIdentityRepository.save(UserIdentity.builder().user(existing).provider("linkedin")
        .providerSubject("li-returning-sub").providerEmail("returning-li@example.com")
        .emailVerified(true).build());

    mockLinkedIn.expect(MockRestRequestMatchers.requestTo(TOKEN_URL))
        .andRespond(MockRestResponseCreators.withSuccess("{\"access_token\":\"li-at\"}",
            MediaType.APPLICATION_JSON));
    mockLinkedIn.expect(MockRestRequestMatchers.requestTo(USERINFO_URL))
        .andRespond(MockRestResponseCreators.withSuccess("{\"sub\":\"li-returning-sub\"}",
            MediaType.APPLICATION_JSON));

    String state = fetchState();

    mockMvc
        .perform(post("/api/auth/linkedin/callback").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("code", "c", "state", state))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.user.email").value("returning-li@example.com"));

    assertThat(userIdentityRepository.findAllByUserId(existing.getId())).hasSize(1);
  }

  @Test
  @DisplayName("profile without usable email returns 401")
  void callback_noEmail_returns401() throws Exception {
    mockLinkedIn.expect(MockRestRequestMatchers.requestTo(TOKEN_URL))
        .andRespond(MockRestResponseCreators.withSuccess("{\"access_token\":\"li-at\"}",
            MediaType.APPLICATION_JSON));
    mockLinkedIn.expect(MockRestRequestMatchers.requestTo(USERINFO_URL))
        .andRespond(MockRestResponseCreators.withSuccess("{\"sub\":\"li-sub-only\"}",
            MediaType.APPLICATION_JSON));

    String state = fetchState();

    mockMvc
        .perform(post("/api/auth/linkedin/callback").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("code", "c", "state", state))))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.error").value(LinkedInOAuthService.ERROR_NO_EMAIL));
  }

  @Test
  @DisplayName("unverified email returns 401 when policy requires verification")
  void callback_unverifiedEmail_returns401() throws Exception {
    mockLinkedIn.expect(MockRestRequestMatchers.requestTo(TOKEN_URL))
        .andRespond(MockRestResponseCreators.withSuccess("{\"access_token\":\"li-at\"}",
            MediaType.APPLICATION_JSON));
    mockLinkedIn.expect(MockRestRequestMatchers.requestTo(USERINFO_URL))
        .andRespond(MockRestResponseCreators.withSuccess(
            "{\"sub\":\"s\",\"email\":\"u@example.com\",\"email_verified\":false}",
            MediaType.APPLICATION_JSON));

    String state = fetchState();

    mockMvc
        .perform(post("/api/auth/linkedin/callback").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("code", "c", "state", state))))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.error").value(LinkedInOAuthService.ERROR_EMAIL_UNVERIFIED));
  }

  @Test
  @DisplayName("token exchange failure returns 401")
  void callback_tokenError_returns401() throws Exception {
    mockLinkedIn.expect(MockRestRequestMatchers.requestTo(TOKEN_URL))
        .andRespond(MockRestResponseCreators.withBadRequest());

    String state = fetchState();

    mockMvc
        .perform(post("/api/auth/linkedin/callback").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("code", "c", "state", state))))
        .andExpect(status().isUnauthorized());
  }

  private String fetchState() throws Exception {
    MvcResult r = mockMvc.perform(get("/api/auth/linkedin")).andExpect(status().isFound())
        .andReturn();
    String location = r.getResponse().getHeader("Location");
    MultiValueMap<String, String> params = UriComponentsBuilder.fromUriString(location).build()
        .getQueryParams();
    return params.getFirst("state");
  }
}
