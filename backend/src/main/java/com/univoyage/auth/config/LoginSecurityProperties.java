package com.univoyage.auth.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

/**
 * Limits for password login: per-account lockout and per-IP request volume.
 */
@ConfigurationProperties(prefix = "app.auth.login")
@Getter
@Setter
public class LoginSecurityProperties {

    /**
     * Wrong password attempts before the account is temporarily locked.
     */
    private int maxFailedAttempts = 5;

    /**
     * How long the account stays locked after exceeding {@link #maxFailedAttempts}.
     */
    private Duration lockDuration = Duration.ofMinutes(15);

    /**
     * Max POST /api/auth/login calls per IP per {@link #ipWindow}.
     */
    private int ipMaxAttempts = 60;

    /**
     * Sliding window length for {@link #ipMaxAttempts}.
     */
    private Duration ipWindow = Duration.ofMinutes(1);
}
