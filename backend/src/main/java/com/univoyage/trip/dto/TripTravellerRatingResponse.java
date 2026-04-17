package com.univoyage.trip.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripTravellerRatingResponse {
    private int stars;
    private String comment;
    private Instant updatedAt;
    /** {@link com.univoyage.trip.model.ReviewModerationStatus} name: PENDING, APPROVED, or REJECTED. */
    private String moderationStatus;
}
