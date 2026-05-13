package com.univoyage.auth.security;

import com.univoyage.auth.oauth.OAuthSecurityProperties;

import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;

/**
 * Per-IP rate limit for OAuth provider callbacks (token exchange abuse protection).
 */
@Component
public class OAuthCallbackIpRateLimiter {

  private final FixedWindowIpRateLimiter delegate;

  public OAuthCallbackIpRateLimiter(OAuthSecurityProperties props, Clock clock) {
    Duration window = props.getCallbackIpWindow();
    int max = props.getCallbackIpMaxAttempts();
    this.delegate = new FixedWindowIpRateLimiter(clock, max, window);
  }

  /**
   * @return -1 if allowed; otherwise seconds until retry
   */
  public long tryConsumeOrRetryAfterSeconds(String rawIp) {
    return delegate.tryConsumeOrRetryAfterSeconds(rawIp);
  }
}
