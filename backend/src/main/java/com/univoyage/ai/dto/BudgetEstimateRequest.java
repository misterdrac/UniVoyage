package com.univoyage.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request DTO for generating an AI budget estimate based on trip details.
 * Contains destination info and travel dates; excludes flights/airfare from estimates.
 */
@Data
public class BudgetEstimateRequest {
    @NotBlank
    private String destinationName;

    @NotBlank
    private String destinationLocation;

    @NotBlank
    private String departureDate;

    @NotBlank
    private String returnDate;
}
