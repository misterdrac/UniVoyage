package com.univoyage.auth.security;

import com.univoyage.auth.config.LoginSecurityProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Fixed-window limiter for login attempts keyed by client IP (in-memory; single-node).
 */
@Component
@RequiredArgsConstructor
public class LoginIpRateLimiter {

    private static final class Window {
        long periodEndMillis;
        int count;
    }

    private final ConcurrentHashMap<String, Window> byIp = new ConcurrentHashMap<>();
    private final LoginSecurityProperties properties;
    private final Clock clock;

    /**
     * @return -1 if the attempt is allowed; otherwise seconds until the current window resets
     */
    public long tryConsumeOrRetryAfterSeconds(String rawIp) {
        String ip = (rawIp == null || rawIp.isBlank()) ? "unknown" : rawIp.trim();
        long now = clock.millis();
        long windowMs = properties.getIpWindow().toMillis();
        int max = properties.getIpMaxAttempts();
        long[] retryAfterSec = { -1L };

        byIp.compute(ip, (key, existing) -> {
            if (existing == null || now >= existing.periodEndMillis) {
                Window w = new Window();
                w.periodEndMillis = now + windowMs;
                w.count = 1;
                retryAfterSec[0] = -1L;
                return w;
            }
            if (existing.count >= max) {
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
