package com.univoyage.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request DTO for generating a packing list based on trip details.
 * Contains fields for destination name, travel dates, and weather forecast summary with validation constraints.
 */
@Data
public class PackingRequest {
    @NotBlank
    private String destinationName;
    
    @NotBlank
    private String departureDate;
    
    @NotBlank
    private String returnDate;
    
    @NotBlank
    private String forecastSummary;
}

