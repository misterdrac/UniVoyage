package com.univoyage.auth.security;

import com.univoyage.auth.config.OtpSecurityProperties;
import org.springframework.stereotype.Component;

import java.time.Clock;

@Component
public class OtpRequestEmailRateLimiter {

  private final FixedWindowIpRateLimiter delegate;

  public OtpRequestEmailRateLimiter(OtpSecurityProperties properties, Clock clock) {
    this.delegate = new FixedWindowIpRateLimiter(clock, properties.getRequestEmailMaxAttempts(),
        properties.getRequestEmailWindow());
  }

  public long tryConsumeOrRetryAfterSeconds(String normalizedEmail) {
    return delegate.tryConsumeOrRetryAfterSeconds("otp-req-email:" + normalizedEmail);
  }
}
