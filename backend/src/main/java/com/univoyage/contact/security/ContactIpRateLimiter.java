package com.univoyage.contact.security;

import com.univoyage.auth.security.FixedWindowIpRateLimiter;
import com.univoyage.contact.config.ContactLimitProperties;
import org.springframework.stereotype.Component;

import java.time.Clock;

@Component
public class ContactIpRateLimiter {

  private final FixedWindowIpRateLimiter delegate;

  public ContactIpRateLimiter(ContactLimitProperties properties, Clock clock) {
    this.delegate = new FixedWindowIpRateLimiter(clock, properties.getIpMaxAttempts(),
        properties.getIpWindow());
  }

  public long tryConsumeOrRetryAfterSeconds(String rawIp) {
    return delegate.tryConsumeOrRetryAfterSeconds(rawIp);
  }
}
