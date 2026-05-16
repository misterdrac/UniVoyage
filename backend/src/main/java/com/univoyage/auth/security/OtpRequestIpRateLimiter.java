package com.univoyage.auth.security;

import com.univoyage.auth.config.OtpSecurityProperties;
import org.springframework.stereotype.Component;

import java.time.Clock;

@Component
public class OtpRequestIpRateLimiter {

  private final FixedWindowIpRateLimiter delegate;

  public OtpRequestIpRateLimiter(OtpSecurityProperties properties, Clock clock) {
    this.delegate = new FixedWindowIpRateLimiter(clock, properties.getRequestIpMaxAttempts(),
        properties.getRequestIpWindow());
  }

  public long tryConsumeOrRetryAfterSeconds(String rawIp) {
    return delegate.tryConsumeOrRetryAfterSeconds("otp-req-ip:" + rawIp);
  }
}
