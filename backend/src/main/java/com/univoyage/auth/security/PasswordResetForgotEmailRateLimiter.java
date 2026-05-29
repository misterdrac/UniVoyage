package com.univoyage.auth.security;

import com.univoyage.auth.config.PasswordResetSecurityProperties;
import org.springframework.stereotype.Component;

import java.time.Clock;

@Component
public class PasswordResetForgotEmailRateLimiter {

  private final FixedWindowIpRateLimiter delegate;

  public PasswordResetForgotEmailRateLimiter(PasswordResetSecurityProperties properties,
      Clock clock) {
    this.delegate = new FixedWindowIpRateLimiter(clock, properties.getForgotEmailMaxAttempts(),
        properties.getForgotEmailWindow());
  }

  public long tryConsumeOrRetryAfterSeconds(String email) {
    return delegate.tryConsumeOrRetryAfterSeconds("pwd-forgot-email:" + email);
  }
}
