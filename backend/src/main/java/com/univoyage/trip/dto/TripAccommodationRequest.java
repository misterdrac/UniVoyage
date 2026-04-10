package com.univoyage.trip.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Request DTO for trip accommodation details.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class TripAccommodationRequest {
    @NotBlank(message = "Accommodation name is required")
    private String accommodationName;
    @NotBlank(message = "Accommodation address is required")
    private String accommodationAddress;
    private String accommodationPhone;
}
