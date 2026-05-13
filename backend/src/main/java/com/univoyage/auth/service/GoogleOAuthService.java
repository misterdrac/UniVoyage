package com.univoyage.auth.service;

import com.univoyage.auth.config.GoogleOAuthHttpConfiguration;
import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.oauth.GoogleOAuthProfileMapper;
import com.univoyage.auth.oauth.GoogleOAuthProperties;
import com.univoyage.auth.oauth.GoogleIdTokenVerifier;
import com.univoyage.auth.oauth.IssuedOAuthState;
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
import org.springframework.security.oauth2.jwt.Jwt;
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

/**
 * Google OAuth 2.0 / OIDC: authorization URL, callback handling with signed state, token exchange,
 * ID token validation, and delegated user/session completion.
 */
@Service
@Slf4j
public class GoogleOAuthService {

  public static final String ERROR_INVALID_STATE = "Invalid or expired OAuth state";
  public static final String ERROR_EMAIL_UNVERIFIED = "Google email is not verified";
  public static final String ERROR_NO_EMAIL = "Google account has no email";

  private static final String AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
  private static final String TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
  /** Minimal scopes: OIDC + email (no profile scope). */
  private static final String SCOPES = "openid email";

  private final GoogleOAuthProperties googleOAuthProperties;
  private final OAuthSecurityProperties oauthSecurityProperties;
  private final OAuthStateService oauthStateService;
  private final OAuthLoginCompletionService oauthLoginCompletionService;
  private final GoogleIdTokenVerifier googleIdTokenVerifier;
  private final RestTemplate googleOAuthRestTemplate;

  public GoogleOAuthService(GoogleOAuthProperties googleOAuthProperties,
      OAuthSecurityProperties oauthSecurityProperties, OAuthStateService oauthStateService,
      OAuthLoginCompletionService oauthLoginCompletionService,
      GoogleIdTokenVerifier googleIdTokenVerifier,
      @Qualifier(GoogleOAuthHttpConfiguration.GOOGLE_OAUTH_REST_TEMPLATE) RestTemplate googleOAuthRestTemplate) {
    this.googleOAuthProperties = googleOAuthProperties;
    this.oauthSecurityProperties = oauthSecurityProperties;
    this.oauthStateService = oauthStateService;
    this.oauthLoginCompletionService = oauthLoginCompletionService;
    this.googleIdTokenVerifier = googleIdTokenVerifier;
    this.googleOAuthRestTemplate = googleOAuthRestTemplate;
  }

  /**
   * Build the Google OAuth 2.0 authorization URL with signed {@code state} and OIDC {@code nonce}.
   */
  public String buildAuthorizationUrl() {
    String clientId = googleOAuthProperties.getClientId();
    List<String> redirectUris = googleOAuthProperties.redirectUriList();
    if (clientId == null || clientId.isBlank()) {
      throw new IllegalStateException("Google OAuth is not configured");
    }
    if (redirectUris.isEmpty()) {
      throw new IllegalStateException("Google OAuth redirect URI allowlist is empty");
    }
    String redirectUri = redirectUris.getFirst();
    OAuthRedirectUriAllowlist.validate(redirectUri, redirectUris);

    if (oauthSecurityProperties.isRequireSignedOAuthState()) {
      IssuedOAuthState issued = oauthStateService.issueState(redirectUri);
      return AUTH_ENDPOINT + "?response_type=code" + "&client_id=" + enc(clientId) + "&redirect_uri="
          + enc(redirectUri) + "&scope=" + enc(SCOPES) + "&state=" + enc(issued.stateQueryParam())
          + "&nonce=" + enc(issued.nonceForAuthorizeUrl()) + "&access_type=offline" + "&prompt=consent";
    }

    return AUTH_ENDPOINT + "?response_type=code" + "&client_id=" + enc(clientId) + "&redirect_uri="
        + enc(redirectUri) + "&scope=" + enc(SCOPES) + "&access_type=offline" + "&prompt=consent";
  }

  /**
   * Completes login after Google redirects back with an authorization code.
   *
   * @param state
   *          signed state echoed by Google when {@link OAuthSecurityProperties#requireSignedOAuthState}
   *          is true; ignored in legacy mode
   */
  @Transactional
  public AuthPayload handleCallback(String code, String state) {
    log.debug("Google OAuth token exchange starting");
    try {
      if (oauthSecurityProperties.isRequireSignedOAuthState()) {
        Optional<OAuthStatePayload> parsedState = oauthStateService.verifyAndParse(state);
        if (parsedState.isEmpty()) {
          return AuthPayload.fail(ERROR_INVALID_STATE);
        }
        OAuthStatePayload oauthState = parsedState.get();
        List<String> allowlist = googleOAuthProperties.redirectUriList();
        OAuthRedirectUriAllowlist.validate(oauthState.redirectUri(), allowlist);
        return finishLogin(code, oauthState.redirectUri(), oauthState.nonce());
      }

      List<String> redirectUris = googleOAuthProperties.redirectUriList();
      String redirectUri = redirectUris.getFirst();
      OAuthRedirectUriAllowlist.validate(redirectUri, redirectUris);
      return finishLogin(code, redirectUri, null);
    } catch (IllegalArgumentException e) {
      log.debug("Google OAuth rejected: {}", e.getMessage());
      return AuthPayload.fail(e.getMessage());
    } catch (RestClientException e) {
      log.debug("Google OAuth HTTP error: {}", e.getMessage());
      return AuthPayload.fail("Google login failed: token exchange error");
    } catch (Exception e) {
      log.warn("Google OAuth failure", e);
      return AuthPayload.fail("Google login failed: " + e.getMessage());
    }
  }

  private AuthPayload finishLogin(String code, String redirectUri, String idTokenNonce) {
    TokenResponse tokens = exchangeCodeForTokens(code, redirectUri);
    if (tokens.idToken() == null || tokens.idToken().isBlank()) {
      return AuthPayload.fail("Google token response missing id_token");
    }

    Jwt jwt = googleIdTokenVerifier.verify(tokens.idToken(), idTokenNonce);
    NormalizedOAuthProfile profile = GoogleOAuthProfileMapper.fromGoogleIdToken(jwt);

    if (profile.email() == null || profile.email().isBlank()) {
      return AuthPayload.fail(ERROR_NO_EMAIL);
    }
    if (oauthSecurityProperties.isRequireEmailVerified() && !profile.emailVerified()) {
      return AuthPayload.fail(ERROR_EMAIL_UNVERIFIED);
    }

    return oauthLoginCompletionService.completeLogin(profile);
  }

  private TokenResponse exchangeCodeForTokens(String code, String redirectUri) {
    String clientId = googleOAuthProperties.getClientId();
    String clientSecret = googleOAuthProperties.getClientSecret();

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

    String body = "code=" + enc(code) + "&client_id=" + enc(clientId) + "&client_secret="
        + enc(clientSecret) + "&redirect_uri=" + enc(redirectUri)
        + "&grant_type=authorization_code";

    ResponseEntity<Map> res = googleOAuthRestTemplate.exchange(TOKEN_ENDPOINT, HttpMethod.POST,
        new HttpEntity<>(body, headers), Map.class);

    if (!res.getStatusCode().is2xxSuccessful() || res.getBody() == null) {
      throw new IllegalStateException("Token exchange failed");
    }

    Map<?, ?> bodyMap = res.getBody();
    String accessToken = stringClaim(bodyMap, "access_token");
    String idToken = stringClaim(bodyMap, "id_token");
    if (accessToken == null || accessToken.isBlank()) {
      throw new IllegalStateException("No access_token returned by Google");
    }
    return new TokenResponse(accessToken, idToken);
  }

  private static String stringClaim(Map<?, ?> map, String key) {
    Object v = map.get(key);
    return v != null ? v.toString() : null;
  }

  private String enc(String s) {
    return URLEncoder.encode(s, StandardCharsets.UTF_8);
  }

  private record TokenResponse(String accessToken, String idToken) {
  }
}
