package com.univoyage.quiz.security;

import com.univoyage.auth.security.FixedWindowIpRateLimiter;
import com.univoyage.quiz.config.QuizLimitProperties;
import org.springframework.stereotype.Component;

import java.time.Clock;

@Component
public class QuizIpRateLimiter {

  private final FixedWindowIpRateLimiter delegate;

  public QuizIpRateLimiter(QuizLimitProperties properties, Clock clock) {
    this.delegate = new FixedWindowIpRateLimiter(clock, properties.getIpMaxAttempts(),
        properties.getIpWindow());
  }

  public long tryConsumeOrRetryAfterSeconds(String rawIp) {
    return delegate.tryConsumeOrRetryAfterSeconds(rawIp);
  }
}
