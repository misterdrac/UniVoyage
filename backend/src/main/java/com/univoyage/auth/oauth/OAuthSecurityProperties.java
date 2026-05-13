package com.univoyage.auth.oauth;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

/**
 * OAuth federated login behaviour shared across providers.
 */
@ConfigurationProperties(prefix = "app.auth.oauth")
@Getter
@Setter
public class OAuthSecurityProperties {

  /**
   * When true, reject Google accounts whose email is missing or not verified.
   */
  private boolean requireEmailVerified = true;

  /** Maximum age of signed OAuth {@code state} parameter. */
  private Duration stateTtl = Duration.ofMinutes(15);

  /**
   * Secret for HMAC signing OAuth state. Defaults to JWT secret when unset (see application.yml).
   */
  private String stateSecret;

  /** Max {@code POST /api/auth/google/callback} calls per IP per {@link #callbackIpWindow}. */
  private int callbackIpMaxAttempts = 60;

  /**
   * When true, the SPA must POST signed {@code state} (and the authorize URL uses OIDC nonce).
   * When false, matches legacy clients that only POST {@code code}; use redirect URI allowlist +
   * ID token validation only (weaker CSRF binding). Prefer true in production once the web app is
   * updated.
   */
  private boolean requireSignedOAuthState = false;

  /** Fixed window length for {@link #callbackIpMaxAttempts}. */
  private Duration callbackIpWindow = Duration.ofMinutes(1);
}