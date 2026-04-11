package com.univoyage.auth.security;

import com.univoyage.auth.config.LoginSecurityProperties;
import org.springframework.stereotype.Component;

import java.time.Clock;

/**
 * Per-IP fixed-window limiter for {@code POST /api/auth/refresh} (separate budget from login).
 */
@Component
public class RefreshIpRateLimiter {

    private final FixedWindowIpRateLimiter delegate;

    public RefreshIpRateLimiter(LoginSecurityProperties properties, Clock clock) {
        this.delegate = new FixedWindowIpRateLimiter(
                clock, properties.getRefreshIpMaxAttempts(), properties.getRefreshIpWindow());
    }

    /**
     * @return -1 if the attempt is allowed; otherwise seconds until the current window resets
     */
    public long tryConsumeOrRetryAfterSeconds(String rawIp) {
        return delegate.tryConsumeOrRetryAfterSeconds(rawIp);
    }
}
