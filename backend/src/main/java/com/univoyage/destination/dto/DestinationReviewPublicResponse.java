package com.univoyage.destination.dto;

import java.time.Instant;

/**
 * Published traveller review for a destination (moderation-approved, public API).
 */
public record DestinationReviewPublicResponse(
        long id,
        int stars,
        String comment,
        String reviewerDisplayName,
        Instant submittedAt
) {}
