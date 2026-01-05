package com.univoyage.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * Request DTO for generating an itinerary based on user preferences.
 * Contains fields for location, dates, and hobbies with validation constraints.
 */
@Data
public class ItineraryRequest {
    @NotBlank
    private String locationLabel;
    
    @NotBlank
    private String departureDate;
    
    @NotBlank
    private String returnDate;
    
    @NotNull
    private List<ItineraryDateInfo> itineraryDates;
    
    private List<String> userHobbies;
    
    @Data
    public static class ItineraryDateInfo {
        private String iso;
        private String label;
    }
}

