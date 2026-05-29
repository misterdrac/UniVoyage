package com.univoyage.auth.security;

import com.univoyage.auth.config.AdminTwoFactorProperties;
import org.springframework.stereotype.Component;

import java.time.Clock;

@Component
public class Admin2faChallengeEmailRateLimiter {

  private final FixedWindowIpRateLimiter delegate;

  public Admin2faChallengeEmailRateLimiter(AdminTwoFactorProperties properties, Clock clock) {
    this.delegate = new FixedWindowIpRateLimiter(clock, properties.getChallengeEmailMaxAttempts(),
        properties.getChallengeEmailWindow());
  }

  public long tryConsumeOrRetryAfterSeconds(String email) {
    return delegate.tryConsumeOrRetryAfterSeconds("admin-2fa-challenge-email:" + email);
  }
}
