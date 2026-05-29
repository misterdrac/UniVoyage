package com.univoyage.auth.service;

import com.univoyage.auth.oauth.GoogleIdTokenVerifier;
import com.univoyage.auth.oauth.GoogleOAuthProperties;
import com.univoyage.auth.oauth.OAuthLoginCompletionService;
import com.univoyage.auth.oauth.OAuthSecurityProperties;
import com.univoyage.auth.oauth.OAuthStateService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import com.univoyage.auth.dto.AuthPayload;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class GoogleOAuthServiceTest {

  @Mock
  private OAuthStateService oauthStateService;
  @Mock
  private OAuthLoginCompletionService oauthLoginCompletionService;
  @Mock
  private GoogleIdTokenVerifier googleIdTokenVerifier;
  @Mock
  private RestTemplate googleOAuthRestTemplate;

  @Test
  @DisplayName("Legacy callback returns explicit config error when redirect URI allowlist is empty")
  void handleCallback_legacyMode_withEmptyRedirectAllowlist_returnsConfigError() {
    GoogleOAuthProperties googleOAuthProperties = new GoogleOAuthProperties();
    googleOAuthProperties.setRedirectUris("");

    OAuthSecurityProperties oauthSecurityProperties = new OAuthSecurityProperties();
    oauthSecurityProperties.setRequireSignedOAuthState(false);

    GoogleOAuthService service = new GoogleOAuthService(googleOAuthProperties,
        oauthSecurityProperties, oauthStateService, oauthLoginCompletionService,
        googleIdTokenVerifier, googleOAuthRestTemplate);

    AuthPayload payload = service.handleCallback("code", "ignored");
    assertThat(payload.isSuccess()).isFalse();
    assertThat(payload.getError())
        .isEqualTo("Google login failed: Google OAuth redirect URI allowlist is empty");
  }
}
