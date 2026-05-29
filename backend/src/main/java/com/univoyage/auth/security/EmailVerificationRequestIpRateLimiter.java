package com.univoyage.auth.security;

import com.univoyage.auth.config.EmailVerificationSecurityProperties;
import org.springframework.stereotype.Component;

import java.time.Clock;

@Component
public class EmailVerificationRequestIpRateLimiter {

  private final FixedWindowIpRateLimiter delegate;

  public EmailVerificationRequestIpRateLimiter(EmailVerificationSecurityProperties properties,
      Clock clock) {
    this.delegate = new FixedWindowIpRateLimiter(clock, properties.getRequestIpMaxAttempts(),
        properties.getRequestIpWindow());
  }

  public long tryConsumeOrRetryAfterSeconds(String ip) {
    return delegate.tryConsumeOrRetryAfterSeconds("email-verify-req-ip:" + ip);
  }
}
