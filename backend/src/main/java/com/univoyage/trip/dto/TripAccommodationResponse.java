package com.univoyage.trip.dto;

import lombok.*;

import java.time.Instant;

/**
 * Response DTO for trip accommodation details.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TripAccommodationResponse {
    private Long tripId;
    private String accommodationName;
    private String accommodationAddress;
    private String accommodationPhone;
    private Instant updatedAt;
}
