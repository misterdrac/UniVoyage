package com.univoyage.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

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

