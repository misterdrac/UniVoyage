package com.univoyage.auth.oauth;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class OAuthStateServiceTest {

  @Test
  @DisplayName("issued state verifies until TTL then expires")
  void verifyRoundTripAndExpiry() {
    Instant start = Instant.parse("2026-05-01T12:00:00Z");
    Clock clock = Clock.fixed(start, ZoneOffset.UTC);
    OAuthSecurityProperties props = new OAuthSecurityProperties();
    props.setStateSecret("unit-test-oauth-state-secret-min-32-chars!!");
    props.setStateTtl(Duration.ofMinutes(15));

    OAuthStateService svc = new OAuthStateService(props, clock);
    IssuedOAuthState issued = svc.issueState("http://localhost:5173/callback");
    assertThat(issued.nonceForAuthorizeUrl()).isNotBlank();

    assertThat(svc.verifyAndParse(issued.stateQueryParam())).isPresent();

    Clock later = Clock.offset(clock, Duration.ofMinutes(20));
    OAuthStateService svcExpired = new OAuthStateService(props, later);
    assertThat(svcExpired.verifyAndParse(issued.stateQueryParam())).isEmpty();
  }

  @Test
  @DisplayName("tampered signature is rejected")
  void rejectsTamperedSignature() {
    Instant start = Instant.parse("2026-05-01T12:00:00Z");
    Clock clock = Clock.fixed(start, ZoneOffset.UTC);
    OAuthSecurityProperties props = new OAuthSecurityProperties();
    props.setStateSecret("unit-test-oauth-state-secret-min-32-chars!!");
    props.setStateTtl(Duration.ofMinutes(15));

    OAuthStateService svc = new OAuthStateService(props, clock);
    IssuedOAuthState issued = svc.issueState("http://localhost/cb");
    String tampered = issued.stateQueryParam() + "x";

    assertThat(svc.verifyAndParse(tampered)).isEmpty();
  }

  @Test
  @DisplayName("constructor fails fast when state secret is too short")
  void rejectsShortSecret() {
    Instant start = Instant.parse("2026-05-01T12:00:00Z");
    Clock clock = Clock.fixed(start, ZoneOffset.UTC);
    OAuthSecurityProperties props = new OAuthSecurityProperties();
    props.setStateSecret("short");
    props.setStateTtl(Duration.ofMinutes(15));

    assertThatThrownBy(() -> new OAuthStateService(props, clock))
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("OAuth state secret must be at least 32 bytes");
  }

  @Test
  @DisplayName("constructor fails fast when state secret is blank")
  void rejectsBlankSecret() {
    Instant start = Instant.parse("2026-05-01T12:00:00Z");
    Clock clock = Clock.fixed(start, ZoneOffset.UTC);
    OAuthSecurityProperties props = new OAuthSecurityProperties();
    props.setStateSecret("");
    props.setStateTtl(Duration.ofMinutes(15));

    assertThatThrownBy(() -> new OAuthStateService(props, clock))
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("OAuth state secret is not configured");
  }
}
