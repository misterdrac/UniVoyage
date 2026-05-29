package com.univoyage.auth.security;

import com.univoyage.auth.config.OtpSecurityProperties;
import org.springframework.stereotype.Component;

import java.time.Clock;

@Component
public class OtpVerifyIpRateLimiter {

  private final FixedWindowIpRateLimiter delegate;

  public OtpVerifyIpRateLimiter(OtpSecurityProperties properties, Clock clock) {
    this.delegate = new FixedWindowIpRateLimiter(clock, properties.getVerifyIpMaxAttempts(),
        properties.getVerifyIpWindow());
  }

  public long tryConsumeOrRetryAfterSeconds(String rawIp) {
    return delegate.tryConsumeOrRetryAfterSeconds("otp-verify-ip:" + rawIp);
  }
}
