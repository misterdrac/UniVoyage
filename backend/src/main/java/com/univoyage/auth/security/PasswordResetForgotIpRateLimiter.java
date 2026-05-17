package com.univoyage.auth.security;

import com.univoyage.auth.config.PasswordResetSecurityProperties;
import org.springframework.stereotype.Component;

import java.time.Clock;

@Component
public class PasswordResetForgotIpRateLimiter {

  private final FixedWindowIpRateLimiter delegate;

  public PasswordResetForgotIpRateLimiter(PasswordResetSecurityProperties properties, Clock clock) {
    this.delegate = new FixedWindowIpRateLimiter(clock, properties.getForgotIpMaxAttempts(),
        properties.getForgotIpWindow());
  }

  public long tryConsumeOrRetryAfterSeconds(String ip) {
    return delegate.tryConsumeOrRetryAfterSeconds("pwd-forgot-ip:" + ip);
  }
}
