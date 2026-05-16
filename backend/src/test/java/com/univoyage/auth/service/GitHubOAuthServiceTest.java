package com.univoyage.auth.service;

import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.oauth.GitHubOAuthProperties;
import com.univoyage.auth.oauth.OAuthLoginCompletionService;
import com.univoyage.auth.oauth.OAuthSecurityProperties;
import com.univoyage.auth.oauth.OAuthStateService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class GitHubOAuthServiceTest {

  @Mock
  private OAuthStateService oauthStateService;
  @Mock
  private OAuthLoginCompletionService oauthLoginCompletionService;
  @Mock
  private UserIdentityService userIdentityService;
  @Mock
  private RestTemplate githubOAuthRestTemplate;

  @Test
  void legacyMode_emptyRedirectAllowlist_returnsConfigError() {
    GitHubOAuthProperties props = new GitHubOAuthProperties();
    props.setRedirectUris("");
    OAuthSecurityProperties oauth = new OAuthSecurityProperties();
    oauth.setRequireSignedOAuthState(false);

    GitHubOAuthService service = new GitHubOAuthService(props, oauth, oauthStateService,
        oauthLoginCompletionService, userIdentityService, githubOAuthRestTemplate);

    AuthPayload payload = service.handleCallback("code", "");
    assertThat(payload.isSuccess()).isFalse();
    assertThat(payload.getError())
        .isEqualTo("GitHub login failed: GitHub OAuth redirect URI allowlist is empty");
  }
}
