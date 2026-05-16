package com.univoyage.auth.oauth;

import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimNames;
import org.springframework.security.oauth2.jwt.JwtClaimValidator;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

import java.util.List;

/**
 * Validates Google ID tokens using Google's JWKS (audience, issuer, expiry).
 */
@Component
@Slf4j
public class DefaultGoogleIdTokenVerifier implements GoogleIdTokenVerifier {

  private static final String JWKS_URI = "https://www.googleapis.com/oauth2/v3/certs";
  private static final String ISSUER = "https://accounts.google.com";

  private final GoogleOAuthProperties googleOAuthProperties;

  private volatile NimbusJwtDecoder decoder;

  public DefaultGoogleIdTokenVerifier(GoogleOAuthProperties googleOAuthProperties) {
    this.googleOAuthProperties = googleOAuthProperties;
  }

  @Override
  public Jwt verify(String idToken, String expectedNonce) {
    String audience = googleOAuthProperties.getClientId();
    if (audience == null || audience.isBlank()) {
      throw new IllegalStateException("Google OAuth client id is not configured");
    }
    NimbusJwtDecoder d = decoder();
    Jwt jwt = d.decode(idToken);
    if (expectedNonce != null && !expectedNonce.isBlank()) {
      String nonce = jwt.getClaimAsString("nonce");
      if (nonce == null || !nonce.equals(expectedNonce)) {
        log.debug("Google ID token nonce mismatch");
        throw new IllegalArgumentException("Google ID token nonce mismatch");
      }
    }
    return jwt;
  }

  private NimbusJwtDecoder decoder() {
    if (decoder != null) {
      return decoder;
    }
    synchronized (this) {
      if (decoder == null) {
        String audience = googleOAuthProperties.getClientId();
        NimbusJwtDecoder d = NimbusJwtDecoder.withJwkSetUri(JWKS_URI).build();
        OAuth2TokenValidator<Jwt> iss = JwtValidators.createDefaultWithIssuer(ISSUER);
        OAuth2TokenValidator<Jwt> aud = new JwtClaimValidator<List<String>>(JwtClaimNames.AUD,
            audClaim -> audClaim != null && audClaim.contains(audience));
        d.setJwtValidator(new DelegatingOAuth2TokenValidator<>(iss, aud));
        decoder = d;
      }
      return decoder;
    }
  }
}
