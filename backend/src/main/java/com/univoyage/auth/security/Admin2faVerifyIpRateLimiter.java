package com.univoyage.auth.security;

import com.univoyage.auth.config.AdminTwoFactorProperties;
import org.springframework.stereotype.Component;

import java.time.Clock;

@Component
public class Admin2faVerifyIpRateLimiter {

  private final FixedWindowIpRateLimiter delegate;

  public Admin2faVerifyIpRateLimiter(AdminTwoFactorProperties properties, Clock clock) {
    this.delegate = new FixedWindowIpRateLimiter(clock, properties.getVerifyIpMaxAttempts(),
        properties.getVerifyIpWindow());
  }

  public long tryConsumeOrRetryAfterSeconds(String rawIp) {
    return delegate.tryConsumeOrRetryAfterSeconds("admin-2fa-verify-ip:" + rawIp);
  }
}
