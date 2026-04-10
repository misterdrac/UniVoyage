package com.univoyage.auth.security;

import com.univoyage.auth.config.LoginSecurityProperties;
import org.springframework.stereotype.Component;

import java.time.Clock;

/**
 * Per-IP fixed-window limiter for {@code POST /api/auth/login}.
 */
@Component
public class LoginIpRateLimiter {

    private final FixedWindowIpRateLimiter delegate;

    public LoginIpRateLimiter(LoginSecurityProperties properties, Clock clock) {
        this.delegate = new FixedWindowIpRateLimiter(
                clock, properties.getIpMaxAttempts(), properties.getIpWindow());
    }

    /**
     * @return -1 if the attempt is allowed; otherwise seconds until the current window resets
     */
    public long tryConsumeOrRetryAfterSeconds(String rawIp) {
        return delegate.tryConsumeOrRetryAfterSeconds(rawIp);
    }
}
