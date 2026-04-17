package com.univoyage.trip.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

/**
 * Per-IP and per-user limits for {@code POST /api/trips/{tripId}/rating}.
 */
@ConfigurationProperties(prefix = "app.trip.rating")
@Getter
@Setter
public class TripRatingLimitProperties {

    /**
     * Max rating POSTs per client IP per {@link #ipWindow}.
     */
    private int ipMaxAttempts = 40;

    private Duration ipWindow = Duration.ofMinutes(1);

    /**
     * Max rating POSTs per authenticated user per {@link #userWindow}.
     */
    private int userMaxAttempts = 30;

    private Duration userWindow = Duration.ofMinutes(1);
}
