package com.univoyage.auth.security;

import com.univoyage.auth.config.EmailVerificationSecurityProperties;
import org.springframework.stereotype.Component;

import java.time.Clock;

@Component
public class EmailVerificationRequestEmailRateLimiter {

  private final FixedWindowIpRateLimiter delegate;

  public EmailVerificationRequestEmailRateLimiter(EmailVerificationSecurityProperties properties,
      Clock clock) {
    this.delegate = new FixedWindowIpRateLimiter(clock, properties.getRequestEmailMaxAttempts(),
        properties.getRequestEmailWindow());
  }

  public long tryConsumeOrRetryAfterSeconds(String email) {
    return delegate.tryConsumeOrRetryAfterSeconds("email-verify-req-email:" + email);
  }
}
