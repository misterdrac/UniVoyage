package com.univoyage.auth.security;

import java.time.Clock;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Fixed-window request counter per client IP (in-memory; single JVM).
 */
public class FixedWindowIpRateLimiter {

    private static final class Window {
        long periodEndMillis;
        int count;
    }

    private final ConcurrentHashMap<String, Window> byIp = new ConcurrentHashMap<>();
    private final Clock clock;
    private final int maxAttempts;
    private final long windowMillis;

    public FixedWindowIpRateLimiter(Clock clock, int maxAttempts, Duration window) {
        this.clock = clock;
        this.maxAttempts = maxAttempts;
        this.windowMillis = window.toMillis();
    }

    /**
     * @return -1 if the attempt is allowed; otherwise seconds until the current window resets
     */
    public long tryConsumeOrRetryAfterSeconds(String rawIp) {
        String ip = (rawIp == null || rawIp.isBlank()) ? "unknown" : rawIp.trim();
        long now = clock.millis();
        long[] retryAfterSec = { -1L };

        byIp.compute(ip, (key, existing) -> {
            if (existing == null || now >= existing.periodEndMillis) {
                Window w = new Window();
                w.periodEndMillis = now + windowMillis;
                w.count = 1;
                retryAfterSec[0] = -1L;
                return w;
            }
            if (existing.count >= maxAttempts) {
                retryAfterSec[0] = Math.max(1L, (existing.periodEndMillis - now + 999) / 1000);
                return existing;
            }
            existing.count++;
            retryAfterSec[0] = -1L;
            return existing;
        });

        return retryAfterSec[0];
    }
}
