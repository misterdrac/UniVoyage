package com.univoyage.auth.service;

import com.univoyage.auth.config.GitHubOAuthHttpConfiguration;
import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.oauth.GitHubOAuthProfileMapper;
import com.univoyage.auth.oauth.GitHubOAuthProperties;
import com.univoyage.auth.oauth.IssuedOAuthState;
import com.univoyage.auth.oauth.NormalizedOAuthProfile;
import com.univoyage.auth.oauth.OAuthLoginCompletionService;
import com.univoyage.auth.oauth.OAuthRedirectUriAllowlist;
import com.univoyage.auth.oauth.OAuthSecurityProperties;
import com.univoyage.auth.oauth.OAuthStatePayload;
import com.univoyage.auth.oauth.OAuthStateService;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import lombok.extern.slf4j.Slf4j;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
public class GitHubOAuthService {

  public static final String ERROR_INVALID_STATE = "Invalid or expired OAuth state";
  public static final String ERROR_EMAIL_UNVERIFIED = "GitHub email is not verified";
  public static final String ERROR_NO_EMAIL = "GitHub account has no email";

  private static final String AUTH_ENDPOINT = "https://github.com/login/oauth/authorize";
  private static final String TOKEN_ENDPOINT = "https://github.com/login/oauth/access_token";
  private static final String USER_ENDPOINT = "https://api.github.com/user";
  private static final String EMAILS_ENDPOINT = "https://api.github.com/user/emails";
  private static final String SCOPES = "read:user user:email";

  private final GitHubOAuthProperties githubOAuthProperties;
  private final OAuthSecurityProperties oauthSecurityProperties;
  private final OAuthStateService oauthStateService;
  private final OAuthLoginCompletionService oauthLoginCompletionService;
  private final UserIdentityService userIdentityService;
  private final RestTemplate githubOAuthRestTemplate;

  public GitHubOAuthService(GitHubOAuthProperties githubOAuthProperties,
      OAuthSecurityProperties oauthSecurityProperties, OAuthStateService oauthStateService,
      OAuthLoginCompletionService oauthLoginCompletionService,
      UserIdentityService userIdentityService,
      @Qualifier(GitHubOAuthHttpConfiguration.GITHUB_OAUTH_REST_TEMPLATE) RestTemplate githubOAuthRestTemplate) {
    this.githubOAuthProperties = githubOAuthProperties;
    this.oauthSecurityProperties = oauthSecurityProperties;
    this.oauthStateService = oauthStateService;
    this.oauthLoginCompletionService = oauthLoginCompletionService;
    this.userIdentityService = userIdentityService;
    this.githubOAuthRestTemplate = githubOAuthRestTemplate;
  }

  public String buildAuthorizationUrl() {
    String clientId = githubOAuthProperties.getClientId();
    List<String> redirectUris = githubOAuthProperties.redirectUriList();
    if (clientId == null || clientId.isBlank()) {
      throw new IllegalStateException("GitHub OAuth is not configured");
    }
    if (redirectUris.isEmpty()) {
      throw new IllegalStateException("GitHub OAuth redirect URI allowlist is empty");
    }
    String redirectUri = redirectUris.getFirst();
    OAuthRedirectUriAllowlist.validate(redirectUri, redirectUris);

    if (oauthSecurityProperties.isRequireSignedOAuthState()) {
      IssuedOAuthState issued = oauthStateService.issueState(redirectUri);
      return AUTH_ENDPOINT + "?client_id=" + enc(clientId) + "&redirect_uri=" + enc(redirectUri)
          + "&scope=" + enc(SCOPES) + "&state=" + enc(issued.stateQueryParam());
    }

    return AUTH_ENDPOINT + "?client_id=" + enc(clientId) + "&redirect_uri=" + enc(redirectUri)
        + "&scope=" + enc(SCOPES);
  }

  @Transactional
  public AuthPayload handleCallback(String code, String state) {
    log.debug("GitHub OAuth token exchange starting");
    try {
      if (oauthSecurityProperties.isRequireSignedOAuthState()) {
        Optional<OAuthStatePayload> parsedState = oauthStateService.verifyAndParse(state);
        if (parsedState.isEmpty()) {
          return AuthPayload.fail(ERROR_INVALID_STATE);
        }
        OAuthStatePayload oauthState = parsedState.get();
        List<String> allowlist = githubOAuthProperties.redirectUriList();
        OAuthRedirectUriAllowlist.validate(oauthState.redirectUri(), allowlist);
        return finishLogin(code, oauthState.redirectUri());
      }

      List<String> redirectUris = githubOAuthProperties.redirectUriList();
      if (redirectUris.isEmpty()) {
        throw new IllegalStateException("GitHub OAuth redirect URI allowlist is empty");
      }
      String redirectUri = redirectUris.getFirst();
      OAuthRedirectUriAllowlist.validate(redirectUri, redirectUris);
      return finishLogin(code, redirectUri);
    } catch (IllegalArgumentException e) {
      log.debug("GitHub OAuth rejected: {}", e.getMessage());
      return AuthPayload.fail(e.getMessage());
    } catch (RestClientException e) {
      log.debug("GitHub OAuth HTTP error: {}", e.getMessage());
      return AuthPayload.fail("GitHub login failed: token exchange error");
    } catch (Exception e) {
      log.warn("GitHub OAuth failure", e);
      return AuthPayload.fail("GitHub login failed: " + e.getMessage());
    }
  }

  private AuthPayload finishLogin(String code, String redirectUri) {
    String accessToken = exchangeCodeForAccessToken(code, redirectUri);
    Map<?, ?> user = fetchGitHubUser(accessToken);
    List<Map<?, ?>> emails = fetchGitHubEmails(accessToken);
    NormalizedOAuthProfile profile = GitHubOAuthProfileMapper.fromGitHubUser(user, emails);

    if (requiresEmail(profile) && profile.email().isBlank()) {
      return AuthPayload.fail(ERROR_NO_EMAIL);
    }
    if (oauthSecurityProperties.isRequireEmailVerified() && !profile.emailVerified()
        && !profile.email().isBlank()) {
      return AuthPayload.fail(ERROR_EMAIL_UNVERIFIED);
    }

    return oauthLoginCompletionService.completeLogin(profile);
  }

  private boolean requiresEmail(NormalizedOAuthProfile profile) {
    if (!profile.email().isBlank()) {
      return true;
    }
    return userIdentityService
        .findByProviderAndSubject(profile.provider().name().toLowerCase(), profile.subject())
        .isEmpty();
  }

  private String exchangeCodeForAccessToken(String code, String redirectUri) {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
    headers.setAccept(List.of(MediaType.APPLICATION_JSON));

    String body = "client_id=" + enc(githubOAuthProperties.getClientId()) + "&client_secret="
        + enc(githubOAuthProperties.getClientSecret()) + "&code=" + enc(code) + "&redirect_uri="
        + enc(redirectUri);

    ResponseEntity<Map> res = githubOAuthRestTemplate.exchange(TOKEN_ENDPOINT, HttpMethod.POST,
        new HttpEntity<>(body, headers), Map.class);

    if (!res.getStatusCode().is2xxSuccessful() || res.getBody() == null) {
      throw new IllegalStateException("Token exchange failed");
    }
    String accessToken = stringClaim(res.getBody(), "access_token");
    if (accessToken == null || accessToken.isBlank()) {
      throw new IllegalStateException("No access_token returned by GitHub");
    }
    return accessToken;
  }

  private Map<?, ?> fetchGitHubUser(String accessToken) {
    HttpHeaders headers = bearerHeaders(accessToken);
    headers.setAccept(List.of(MediaType.APPLICATION_JSON));
    ResponseEntity<Map> res = githubOAuthRestTemplate.exchange(USER_ENDPOINT, HttpMethod.GET,
        new HttpEntity<>(headers), Map.class);
    if (!res.getStatusCode().is2xxSuccessful() || res.getBody() == null) {
      throw new IllegalStateException("Failed to fetch GitHub user");
    }
    return res.getBody();
  }

  @SuppressWarnings("unchecked")
  private List<Map<?, ?>> fetchGitHubEmails(String accessToken) {
    HttpHeaders headers = bearerHeaders(accessToken);
    headers.setAccept(List.of(MediaType.APPLICATION_JSON));
    ResponseEntity<List<Map<?, ?>>> res = githubOAuthRestTemplate.exchange(EMAILS_ENDPOINT,
        HttpMethod.GET, new HttpEntity<>(headers),
        new ParameterizedTypeReference<List<Map<?, ?>>>() {
        });
    if (!res.getStatusCode().is2xxSuccessful() || res.getBody() == null) {
      return List.of();
    }
    return res.getBody();
  }

  private static HttpHeaders bearerHeaders(String accessToken) {
    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(accessToken);
    return headers;
  }

  private static String stringClaim(Map<?, ?> map, String key) {
    Object v = map.get(key);
    return v != null ? v.toString() : null;
  }

  private String enc(String s) {
    return URLEncoder.encode(s, StandardCharsets.UTF_8);
  }
}
