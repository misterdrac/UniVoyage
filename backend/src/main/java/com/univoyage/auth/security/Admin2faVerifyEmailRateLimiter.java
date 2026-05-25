package com.univoyage.auth.security;

import com.univoyage.auth.config.AdminTwoFactorProperties;
import org.springframework.stereotype.Component;

import java.time.Clock;

@Component
public class Admin2faVerifyEmailRateLimiter {

  private final FixedWindowIpRateLimiter delegate;

  public Admin2faVerifyEmailRateLimiter(AdminTwoFactorProperties properties, Clock clock) {
    this.delegate = new FixedWindowIpRateLimiter(clock, properties.getVerifyEmailMaxAttempts(),
        properties.getVerifyEmailWindow());
  }

  public long tryConsumeOrRetryAfterSeconds(String email) {
    return delegate.tryConsumeOrRetryAfterSeconds("admin-2fa-verify-email:" + email);
  }
}
