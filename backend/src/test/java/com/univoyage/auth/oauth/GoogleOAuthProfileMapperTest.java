package com.univoyage.auth.oauth;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

class GoogleOAuthProfileMapperTest {

  @Test
  @DisplayName("maps standard Google ID token claims")
  void mapsClaims() {
    Instant now = Instant.parse("2026-01-01T00:00:00Z");
    Jwt jwt = Jwt.withTokenValue("t").headers(h -> h.put("alg", "none")).issuedAt(now)
        .expiresAt(now.plusSeconds(300)).subject("google-sub-99").claim("email", "u@example.com")
        .claim("email_verified", true).claim("given_name", "Ann").claim("family_name", "Bee")
        .claim("picture", "https://example.com/p.jpg").build();

    NormalizedOAuthProfile p = GoogleOAuthProfileMapper.fromGoogleIdToken(jwt);

    assertThat(p.provider()).isEqualTo(IdentityProvider.GOOGLE);
    assertThat(p.subject()).isEqualTo("google-sub-99");
    assertThat(p.email()).isEqualTo("u@example.com");
    assertThat(p.emailVerified()).isTrue();
    assertThat(p.givenName()).isEqualTo("Ann");
    assertThat(p.familyName()).isEqualTo("Bee");
    assertThat(p.picture()).isEqualTo("https://example.com/p.jpg");
  }

  @Test
  @DisplayName("treats absent email_verified as false")
  void missingVerifiedClaim() {
    Instant now = Instant.now();
    Jwt jwt = Jwt.withTokenValue("t").headers(h -> h.put("alg", "none")).issuedAt(now)
        .expiresAt(now.plusSeconds(60)).subject("s").claim("email", "x@y.com").build();

    NormalizedOAuthProfile p = GoogleOAuthProfileMapper.fromGoogleIdToken(jwt);
    assertThat(p.emailVerified()).isFalse();
  }
}
