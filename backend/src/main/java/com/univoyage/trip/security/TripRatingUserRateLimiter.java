package com.univoyage.trip.security;

import com.univoyage.auth.security.FixedWindowIpRateLimiter;
import com.univoyage.trip.config.TripRatingLimitProperties;
import org.springframework.stereotype.Component;

import java.time.Clock;

/**
 * Per-authenticated-user fixed-window limiter for {@code POST /api/trips/{tripId}/rating}.
 */
@Component
public class TripRatingUserRateLimiter {

    private final FixedWindowIpRateLimiter delegate;

    public TripRatingUserRateLimiter(TripRatingLimitProperties properties, Clock clock) {
        this.delegate = new FixedWindowIpRateLimiter(
                clock, properties.getUserMaxAttempts(), properties.getUserWindow());
    }

    /**
     * @return -1 if the attempt is allowed; otherwise seconds until the current window resets
     */
    public long tryConsumeOrRetryAfterSeconds(Long userId) {
        if (userId == null) {
            return -1;
        }
        return delegate.tryConsumeOrRetryAfterSeconds("user:" + userId);
    }
}
