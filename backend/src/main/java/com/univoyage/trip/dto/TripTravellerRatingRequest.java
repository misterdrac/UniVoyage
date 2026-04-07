package com.univoyage.trip.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request body for submitting or updating the current user's rating for a trip.
 */
@Data
public class TripTravellerRatingRequest {

    @Min(1)
    @Max(5)
    private int stars;

    @Size(max = 2000)
    private String comment;
}
