package com.univoyage.auth.security;

import com.univoyage.auth.config.AdminTwoFactorProperties;
import org.springframework.stereotype.Component;

import java.time.Clock;

@Component
public class Admin2faChallengeIpRateLimiter {

  private final FixedWindowIpRateLimiter delegate;

  public Admin2faChallengeIpRateLimiter(AdminTwoFactorProperties properties, Clock clock) {
    this.delegate = new FixedWindowIpRateLimiter(clock, properties.getChallengeIpMaxAttempts(),
        properties.getChallengeIpWindow());
  }

  public long tryConsumeOrRetryAfterSeconds(String rawIp) {
    return delegate.tryConsumeOrRetryAfterSeconds("admin-2fa-challenge-ip:" + rawIp);
  }
}
