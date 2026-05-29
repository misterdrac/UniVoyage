package com.univoyage.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.auth.config.GitHubOAuthHttpConfiguration;
import com.univoyage.auth.model.UserIdentity;
import com.univoyage.auth.repository.UserIdentityRepository;
import com.univoyage.auth.service.GitHubOAuthService;
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

@SpringBootTest(properties = {"app.auth.github.client-id=test-github-client",
    "app.auth.github.client-secret=test-github-secret",
    "app.auth.github.redirect-uris=http://localhost:5173/auth/github/callback",
    "app.auth.oauth.callback-ip-max-attempts=100"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class GitHubOAuthCallbackFlowIntegrationTest {

  private static final String TOKEN_URL = "https://github.com/login/oauth/access_token";
  private static final String USER_URL = "https://api.github.com/user";
  private static final String EMAILS_URL = "https://api.github.com/user/emails";

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private UserIdentityRepository userIdentityRepository;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  @Qualifier(GitHubOAuthHttpConfiguration.GITHUB_OAUTH_REST_TEMPLATE)
  private RestTemplate githubOAuthRestTemplate;

  private MockRestServiceServer mockGitHub;

  @BeforeEach
  void bindMock() {
    mockGitHub = MockRestServiceServer.bindTo(githubOAuthRestTemplate).build();
  }

  @AfterEach
  void verifyMock() {
    mockGitHub.verify();
  }

  @Test
  @DisplayName("happy path: token + user + emails creates github identity")
  void callback_success_firstLogin() throws Exception {
    expectToken("{\"access_token\":\"gh-at\"}");
    expectUser(
        "{\"id\":9001,\"login\":\"octo\",\"name\":\"Octo Cat\",\"avatar_url\":\"https://example.com/a.png\"}");
    expectEmails("[{\"email\":\"github-flow@example.com\",\"primary\":true,\"verified\":true}]");

    String state = fetchState();

    mockMvc
        .perform(post("/api/auth/github/callback").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("code", "gh-code", "state", state))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.user.email").value("github-flow@example.com"));

    assertThat(userIdentityRepository.findByProviderAndProviderSubject("github", "9001"))
        .isPresent();
  }

  @Test
  @DisplayName("returning user: same GitHub id does not create duplicate identity")
  void callback_returningUser_noDuplicateIdentity() throws Exception {
    UserEntity existing = userRepository.save(UserEntity.builder().email("returning-gh@example.com")
        .name("R").surname("U").passwordHash("{noop}x").dateOfRegister(Instant.now())
        .dateOfLastSignin(Instant.now()).role(Role.USER).build());
    userIdentityRepository
        .save(UserIdentity.builder().user(existing).provider("github").providerSubject("7777")
            .providerEmail("returning-gh@example.com").emailVerified(true).build());

    expectToken("{\"access_token\":\"gh-at\"}");
    expectUser("{\"id\":7777,\"login\":\"returning\"}");
    expectEmails("[]");

    String state = fetchState();

    mockMvc
        .perform(post("/api/auth/github/callback").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("code", "c", "state", state))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.user.email").value("returning-gh@example.com"));

    assertThat(userIdentityRepository.findAllByUserId(existing.getId())).hasSize(1);
  }

  @Test
  @DisplayName("repeat login with same GitHub subject does not insert a second identity row")
  void callback_repeatLogin_sameSubject_singleIdentity() throws Exception {
    expectToken("{\"access_token\":\"gh-at\"}");
    expectUser("{\"id\":5555,\"login\":\"repeat\",\"name\":\"Rep User\"}");
    expectEmails("[{\"email\":\"repeat-gh@example.com\",\"primary\":true,\"verified\":true}]");
    expectToken("{\"access_token\":\"gh-at2\"}");
    expectUser("{\"id\":5555,\"login\":\"repeat\"}");
    expectEmails("[]");

    String state = fetchState();
    mockMvc
        .perform(post("/api/auth/github/callback").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("code", "c1", "state", state))))
        .andExpect(status().isOk());

    assertThat(userIdentityRepository.findByProviderAndProviderSubject("github", "5555"))
        .isPresent();

    String state2 = fetchState();
    mockMvc
        .perform(post("/api/auth/github/callback").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("code", "c2", "state", state2))))
        .andExpect(status().isOk());

    assertThat(userIdentityRepository.findAll().stream()
        .filter(i -> "github".equals(i.getProvider()) && "5555".equals(i.getProviderSubject()))
        .count()).isEqualTo(1);
  }

  @Test
  @DisplayName("first GitHub login links to existing local user with same email (no duplicate user)")
  void callback_linksExistingUserByEmail() throws Exception {
    UserEntity existing = userRepository
        .save(UserEntity.builder().email("link-me@example.com").name("Local").surname("User")
            .passwordHash("{noop}x").dateOfRegister(Instant.now()).role(Role.USER).build());

    expectToken("{\"access_token\":\"gh-at\"}");
    expectUser("{\"id\":3333,\"login\":\"linker\"}");
    expectEmails("[{\"email\":\"link-me@example.com\",\"primary\":true,\"verified\":true}]");

    String state = fetchState();

    mockMvc
        .perform(post("/api/auth/github/callback").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("code", "c", "state", state))))
        .andExpect(status().isOk()).andExpect(jsonPath("$.data.user.id").value(existing.getId()));

    var identity = userIdentityRepository.findByProviderAndProviderSubject("github", "3333");
    assertThat(identity).isPresent();
    assertThat(identity.get().getUser().getId()).isEqualTo(existing.getId());
  }

  @Test
  @DisplayName("missing email returns 401")
  void callback_noEmail_returns401() throws Exception {
    expectToken("{\"access_token\":\"gh-at\"}");
    expectUser("{\"id\":1,\"login\":\"ghost\"}");
    expectEmails("[]");

    String state = fetchState();

    mockMvc
        .perform(post("/api/auth/github/callback").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("code", "c", "state", state))))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.error").value(GitHubOAuthService.ERROR_NO_EMAIL));
  }

  @Test
  @DisplayName("tampered state returns 400")
  void callback_badState_returns400() throws Exception {
    String state = fetchState() + "tamper";

    mockMvc
        .perform(post("/api/auth/github/callback").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("code", "c", "state", state))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value(GitHubOAuthService.ERROR_INVALID_STATE));
  }

  @Test
  @DisplayName("token exchange failure returns 401")
  void callback_tokenError_returns401() throws Exception {
    mockGitHub.expect(MockRestRequestMatchers.requestTo(TOKEN_URL))
        .andRespond(MockRestResponseCreators.withBadRequest());

    String state = fetchState();

    mockMvc
        .perform(post("/api/auth/github/callback").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("code", "c", "state", state))))
        .andExpect(status().isUnauthorized());
  }

  private void expectToken(String json) {
    mockGitHub.expect(MockRestRequestMatchers.requestTo(TOKEN_URL))
        .andRespond(MockRestResponseCreators.withSuccess(json, MediaType.APPLICATION_JSON));
  }

  private void expectUser(String json) {
    mockGitHub.expect(MockRestRequestMatchers.requestTo(USER_URL))
        .andRespond(MockRestResponseCreators.withSuccess(json, MediaType.APPLICATION_JSON));
  }

  private void expectEmails(String json) {
    mockGitHub.expect(MockRestRequestMatchers.requestTo(EMAILS_URL))
        .andRespond(MockRestResponseCreators.withSuccess(json, MediaType.APPLICATION_JSON));
  }

  private String fetchState() throws Exception {
    MvcResult r = mockMvc.perform(get("/api/auth/github")).andExpect(status().isFound())
        .andReturn();
    String location = r.getResponse().getHeader("Location");
    MultiValueMap<String, String> params = UriComponentsBuilder.fromUriString(location).build()
        .getQueryParams();
    return params.getFirst("state");
  }
}
