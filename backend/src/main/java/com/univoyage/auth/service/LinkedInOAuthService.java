package com.univoyage.auth.service;

import com.univoyage.auth.config.LinkedInOAuthHttpConfiguration;
import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.oauth.IssuedOAuthState;
import com.univoyage.auth.oauth.LinkedInOAuthProfileMapper;
import com.univoyage.auth.oauth.LinkedInOAuthProperties;
import com.univoyage.auth.oauth.NormalizedOAuthProfile;
import com.univoyage.auth.oauth.OAuthLoginCompletionService;
import com.univoyage.auth.oauth.OAuthRedirectUriAllowlist;
import com.univoyage.auth.oauth.OAuthSecurityProperties;
import com.univoyage.auth.oauth.OAuthStatePayload;
import com.univoyage.auth.oauth.OAuthStateService;

import org.springframework.beans.factory.annotation.Qualifier;
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
public class LinkedInOAuthService {

  public static final String ERROR_INVALID_STATE = "Invalid or expired OAuth state";
  public static final String ERROR_EMAIL_UNVERIFIED = "LinkedIn email is not verified";
  public static final String ERROR_NO_EMAIL = "LinkedIn account has no email";

  private static final String AUTH_ENDPOINT = "https://www.linkedin.com/oauth/v2/authorization";
  private static final String TOKEN_ENDPOINT = "https://www.linkedin.com/oauth/v2/accessToken";
  private static final String USERINFO_ENDPOINT = "https://api.linkedin.com/v2/userinfo";
  private static final String SCOPES = "openid profile email";

  private final LinkedInOAuthProperties linkedInOAuthProperties;
  private final OAuthSecurityProperties oauthSecurityProperties;
  private final OAuthStateService oauthStateService;
  private final OAuthLoginCompletionService oauthLoginCompletionService;
  private final UserIdentityService userIdentityService;
  private final RestTemplate linkedinOAuthRestTemplate;

  public LinkedInOAuthService(LinkedInOAuthProperties linkedInOAuthProperties,
      OAuthSecurityProperties oauthSecurityProperties, OAuthStateService oauthStateService,
      OAuthLoginCompletionService oauthLoginCompletionService,
      UserIdentityService userIdentityService,
      @Qualifier(LinkedInOAuthHttpConfiguration.LINKEDIN_OAUTH_REST_TEMPLATE) RestTemplate linkedinOAuthRestTemplate) {
    this.linkedInOAuthProperties = linkedInOAuthProperties;
    this.oauthSecurityProperties = oauthSecurityProperties;
    this.oauthStateService = oauthStateService;
    this.oauthLoginCompletionService = oauthLoginCompletionService;
    this.userIdentityService = userIdentityService;
    this.linkedinOAuthRestTemplate = linkedinOAuthRestTemplate;
  }

  public String buildAuthorizationUrl() {
    String clientId = linkedInOAuthProperties.getClientId();
    List<String> redirectUris = linkedInOAuthProperties.redirectUriList();
    if (clientId == null || clientId.isBlank()) {
      throw new IllegalStateException("LinkedIn OAuth is not configured");
    }
    if (redirectUris.isEmpty()) {
      throw new IllegalStateException("LinkedIn OAuth redirect URI allowlist is empty");
    }
    String redirectUri = redirectUris.getFirst();
    OAuthRedirectUriAllowlist.validate(redirectUri, redirectUris);

    if (oauthSecurityProperties.isRequireSignedOAuthState()) {
      IssuedOAuthState issued = oauthStateService.issueState(redirectUri);
      return AUTH_ENDPOINT + "?response_type=code" + "&client_id=" + enc(clientId)
          + "&redirect_uri=" + enc(redirectUri) + "&scope=" + enc(SCOPES) + "&state="
          + enc(issued.stateQueryParam());
    }

    return AUTH_ENDPOINT + "?response_type=code" + "&client_id=" + enc(clientId) + "&redirect_uri="
        + enc(redirectUri) + "&scope=" + enc(SCOPES);
  }

  @Transactional
  public AuthPayload handleCallback(String code, String state) {
    log.debug("LinkedIn OAuth token exchange starting");
    try {
      if (oauthSecurityProperties.isRequireSignedOAuthState()) {
        Optional<OAuthStatePayload> parsedState = oauthStateService.verifyAndParse(state);
        if (parsedState.isEmpty()) {
          return AuthPayload.fail(ERROR_INVALID_STATE);
        }
        OAuthStatePayload oauthState = parsedState.get();
        List<String> allowlist = linkedInOAuthProperties.redirectUriList();
        OAuthRedirectUriAllowlist.validate(oauthState.redirectUri(), allowlist);
        return finishLogin(code, oauthState.redirectUri());
      }

      List<String> redirectUris = linkedInOAuthProperties.redirectUriList();
      if (redirectUris.isEmpty()) {
        throw new IllegalStateException("LinkedIn OAuth redirect URI allowlist is empty");
      }
      String redirectUri = redirectUris.getFirst();
      OAuthRedirectUriAllowlist.validate(redirectUri, redirectUris);
      return finishLogin(code, redirectUri);
    } catch (IllegalArgumentException e) {
      log.debug("LinkedIn OAuth rejected: {}", e.getMessage());
      return AuthPayload.fail(e.getMessage());
    } catch (RestClientException e) {
      log.debug("LinkedIn OAuth HTTP error: {}", e.getMessage());
      return AuthPayload.fail("LinkedIn login failed: token exchange error");
    } catch (Exception e) {
      log.warn("LinkedIn OAuth failure", e);
      return AuthPayload.fail("LinkedIn login failed: " + e.getMessage());
    }
  }

  private AuthPayload finishLogin(String code, String redirectUri) {
    String accessToken = exchangeCodeForAccessToken(code, redirectUri);
    Map<?, ?> userInfo = fetchUserInfo(accessToken);
    NormalizedOAuthProfile profile = LinkedInOAuthProfileMapper.fromUserInfo(userInfo);

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

    String body = "grant_type=authorization_code" + "&code=" + enc(code) + "&redirect_uri="
        + enc(redirectUri) + "&client_id=" + enc(linkedInOAuthProperties.getClientId())
        + "&client_secret=" + enc(linkedInOAuthProperties.getClientSecret());

    ResponseEntity<Map> res = linkedinOAuthRestTemplate.exchange(TOKEN_ENDPOINT, HttpMethod.POST,
        new HttpEntity<>(body, headers), Map.class);

    if (!res.getStatusCode().is2xxSuccessful() || res.getBody() == null) {
      throw new IllegalStateException("Token exchange failed");
    }
    String accessToken = stringClaim(res.getBody(), "access_token");
    if (accessToken == null || accessToken.isBlank()) {
      throw new IllegalStateException("No access_token returned by LinkedIn");
    }
    return accessToken;
  }

  private Map<?, ?> fetchUserInfo(String accessToken) {
    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(accessToken);
    headers.setAccept(List.of(MediaType.APPLICATION_JSON));
    ResponseEntity<Map> res = linkedinOAuthRestTemplate.exchange(USERINFO_ENDPOINT, HttpMethod.GET,
        new HttpEntity<>(headers), Map.class);
    if (!res.getStatusCode().is2xxSuccessful() || res.getBody() == null) {
      throw new IllegalStateException("Failed to fetch LinkedIn userinfo");
    }
    return res.getBody();
  }

  private static String stringClaim(Map<?, ?> map, String key) {
    Object v = map.get(key);
    return v != null ? v.toString() : null;
  }

  private String enc(String s) {
    return URLEncoder.encode(s, StandardCharsets.UTF_8);
  }
}
