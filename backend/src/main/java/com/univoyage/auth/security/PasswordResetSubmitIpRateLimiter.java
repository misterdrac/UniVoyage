package com.univoyage.auth.security;

import com.univoyage.auth.config.PasswordResetSecurityProperties;
import org.springframework.stereotype.Component;

import java.time.Clock;

@Component
public class PasswordResetSubmitIpRateLimiter {

  private final FixedWindowIpRateLimiter delegate;

  public PasswordResetSubmitIpRateLimiter(PasswordResetSecurityProperties properties, Clock clock) {
    this.delegate = new FixedWindowIpRateLimiter(clock, properties.getResetIpMaxAttempts(),
        properties.getResetIpWindow());
  }

  public long tryConsumeOrRetryAfterSeconds(String ip) {
    return delegate.tryConsumeOrRetryAfterSeconds("pwd-reset-ip:" + ip);
  }
}
