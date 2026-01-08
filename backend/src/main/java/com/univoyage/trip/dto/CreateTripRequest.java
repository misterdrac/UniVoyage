package com.univoyage.trip.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request DTO for creating a new trip.
 */
@Data
public class CreateTripRequest {
    @NotNull
    private Long destinationId;

    @NotBlank
    private String departureDate; // YYYY-MM-DD

    @NotBlank
    private String returnDate;    // YYYY-MM-DD
}
