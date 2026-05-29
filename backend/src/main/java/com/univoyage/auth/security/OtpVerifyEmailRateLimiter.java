package com.univoyage.auth.security;

import com.univoyage.auth.config.OtpSecurityProperties;
import org.springframework.stereotype.Component;

import java.time.Clock;

@Component
public class OtpVerifyEmailRateLimiter {

  private final FixedWindowIpRateLimiter delegate;

  public OtpVerifyEmailRateLimiter(OtpSecurityProperties properties, Clock clock) {
    this.delegate = new FixedWindowIpRateLimiter(clock, properties.getVerifyEmailMaxAttempts(),
        properties.getVerifyEmailWindow());
  }

  public long tryConsumeOrRetryAfterSeconds(String normalizedEmail) {
    return delegate.tryConsumeOrRetryAfterSeconds("otp-verify-email:" + normalizedEmail);
  }
}
