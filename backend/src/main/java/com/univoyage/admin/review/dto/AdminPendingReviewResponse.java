package com.univoyage.admin.review.dto;

import java.time.Instant;

/**
 * A traveller review awaiting moderation (staff-only).
 */
public record AdminPendingReviewResponse(
        long ratingId,
        long tripId,
        long destinationId,
        String destinationName,
        String userEmail,
        int stars,
        String comment,
        Instant createdAt,
        Instant updatedAt
) {}
