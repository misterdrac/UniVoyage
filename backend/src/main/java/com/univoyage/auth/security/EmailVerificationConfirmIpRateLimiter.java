package com.univoyage.auth.security;

import com.univoyage.auth.config.EmailVerificationSecurityProperties;
import org.springframework.stereotype.Component;

import java.time.Clock;

@Component
public class EmailVerificationConfirmIpRateLimiter {

  private final FixedWindowIpRateLimiter delegate;

  public EmailVerificationConfirmIpRateLimiter(EmailVerificationSecurityProperties properties,
      Clock clock) {
    this.delegate = new FixedWindowIpRateLimiter(clock, properties.getConfirmIpMaxAttempts(),
        properties.getConfirmIpWindow());
  }

  public long tryConsumeOrRetryAfterSeconds(String ip) {
    return delegate.tryConsumeOrRetryAfterSeconds("email-verify-confirm-ip:" + ip);
  }
}
