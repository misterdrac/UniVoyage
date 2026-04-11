package com.univoyage.trip.security;

import com.univoyage.auth.security.FixedWindowIpRateLimiter;
import com.univoyage.trip.config.TripRatingLimitProperties;
import org.springframework.stereotype.Component;

import java.time.Clock;

/**
 * Per-IP fixed-window limiter for {@code POST /api/trips/{tripId}/rating}.
 */
@Component
public class TripRatingIpRateLimiter {

    private final FixedWindowIpRateLimiter delegate;

    public TripRatingIpRateLimiter(TripRatingLimitProperties properties, Clock clock) {
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
