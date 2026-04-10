package com.univoyage.auth.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FixedWindowIpRateLimiterTest {

    @Test
    @DisplayName("Returns -1 while under max attempts for the same IP in the current window")
    void allowsUpToMaxAttempts() {
        Clock clock = Clock.fixed(Instant.parse("2026-01-01T00:00:00Z"), ZoneOffset.UTC);
        FixedWindowIpRateLimiter limiter = new FixedWindowIpRateLimiter(clock, 3, Duration.ofMinutes(1));

        assertEquals(-1, limiter.tryConsumeOrRetryAfterSeconds("192.168.1.1"));
        assertEquals(-1, limiter.tryConsumeOrRetryAfterSeconds("192.168.1.1"));
        assertEquals(-1, limiter.tryConsumeOrRetryAfterSeconds("192.168.1.1"));
    }

    @Test
    @DisplayName("After max attempts, returns positive retry-after seconds until window end")
    void blocksWithRetryAfterWhenOverLimit() {
        Clock clock = Clock.fixed(Instant.parse("2026-01-01T00:00:00Z"), ZoneOffset.UTC);
        FixedWindowIpRateLimiter limiter = new FixedWindowIpRateLimiter(clock, 3, Duration.ofMinutes(1));

        assertEquals(-1, limiter.tryConsumeOrRetryAfterSeconds("10.0.0.1"));
        assertEquals(-1, limiter.tryConsumeOrRetryAfterSeconds("10.0.0.1"));
        assertEquals(-1, limiter.tryConsumeOrRetryAfterSeconds("10.0.0.1"));

        long retry = limiter.tryConsumeOrRetryAfterSeconds("10.0.0.1");
        assertTrue(retry > 0 && retry <= 120, "retry should be bounded window remainder in seconds: " + retry);
    }

    @Test
    @DisplayName("Different IPs have independent counters")
    void separateCountersPerIp() {
        Clock clock = Clock.fixed(Instant.parse("2026-06-01T12:00:00Z"), ZoneOffset.UTC);
        FixedWindowIpRateLimiter limiter = new FixedWindowIpRateLimiter(clock, 3, Duration.ofMinutes(1));

        for (int i = 0; i < 3; i++) {
            assertEquals(-1, limiter.tryConsumeOrRetryAfterSeconds("ip-a"));
        }
        assertTrue(limiter.tryConsumeOrRetryAfterSeconds("ip-a") >= 0);

        assertEquals(-1, limiter.tryConsumeOrRetryAfterSeconds("ip-b"));
    }

    @Test
    @DisplayName("Blank IP is normalized to a single bucket key")
    void blankIpUsesUnknownBucket() {
        Clock clock = Clock.fixed(Instant.parse("2026-06-01T12:00:00Z"), ZoneOffset.UTC);
        FixedWindowIpRateLimiter limiter = new FixedWindowIpRateLimiter(clock, 3, Duration.ofMinutes(1));

        assertEquals(-1, limiter.tryConsumeOrRetryAfterSeconds(""));
        assertEquals(-1, limiter.tryConsumeOrRetryAfterSeconds("   "));
        assertEquals(-1, limiter.tryConsumeOrRetryAfterSeconds(null));

        assertTrue(limiter.tryConsumeOrRetryAfterSeconds("") >= 0);
    }

    @Test
    @DisplayName("When wall clock passes window end, counter resets for that IP")
    void windowResetAfterDuration() {
        AtomicLong epochMillis = new AtomicLong(0L);
        Clock clock = new Clock() {
            @Override
            public ZoneId getZone() {
                return ZoneOffset.UTC;
            }

            @Override
            public Clock withZone(ZoneId zone) {
                return this;
            }

            @Override
            public Instant instant() {
                return Instant.ofEpochMilli(epochMillis.get());
            }
        };

        FixedWindowIpRateLimiter limiter = new FixedWindowIpRateLimiter(clock, 3, Duration.ofMillis(10_000));

        assertEquals(-1, limiter.tryConsumeOrRetryAfterSeconds("moving"));
        assertEquals(-1, limiter.tryConsumeOrRetryAfterSeconds("moving"));
        assertEquals(-1, limiter.tryConsumeOrRetryAfterSeconds("moving"));
        assertTrue(limiter.tryConsumeOrRetryAfterSeconds("moving") >= 0);

        epochMillis.set(10_000);
        assertEquals(-1, limiter.tryConsumeOrRetryAfterSeconds("moving"));
    }
}
