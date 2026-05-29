package com.univoyage.auth.service;

import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.oauth.LinkedInOAuthProperties;
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
class LinkedInOAuthServiceTest {

  @Mock
  private OAuthStateService oauthStateService;
  @Mock
  private OAuthLoginCompletionService oauthLoginCompletionService;
  @Mock
  private UserIdentityService userIdentityService;
  @Mock
  private RestTemplate linkedinOAuthRestTemplate;

  @Test
  void legacyMode_emptyRedirectAllowlist_returnsConfigError() {
    LinkedInOAuthProperties props = new LinkedInOAuthProperties();
    props.setRedirectUris("");
    OAuthSecurityProperties oauth = new OAuthSecurityProperties();
    oauth.setRequireSignedOAuthState(false);

    LinkedInOAuthService service = new LinkedInOAuthService(props, oauth, oauthStateService,
        oauthLoginCompletionService, userIdentityService, linkedinOAuthRestTemplate);

    AuthPayload payload = service.handleCallback("code", "");
    assertThat(payload.isSuccess()).isFalse();
    assertThat(payload.getError())
        .isEqualTo("LinkedIn login failed: LinkedIn OAuth redirect URI allowlist is empty");
  }
}
