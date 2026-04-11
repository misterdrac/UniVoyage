package com.univoyage.trip.model;

/**
 * Moderation state for traveller-written review text. Star-only ratings skip pending review.
 */
public enum ReviewModerationStatus {
    PENDING,
    APPROVED,
    REJECTED
}
