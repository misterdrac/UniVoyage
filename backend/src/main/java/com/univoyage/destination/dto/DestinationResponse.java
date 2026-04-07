package com.univoyage.destination.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Response DTO for Destination entity.
 * Contains detailed information about a travel destination.
 */
@Data
@Builder
public class DestinationResponse {
    private Long id;
    private String title;
    private String location;
    private String continent;
    private CountryResponse country;
    private String imageUrl;
    private String imageAlt;
    private String overview;
    private Integer budgetPerDay;
    private String whyVisit;
    private List<String> studentPerks;
    /** 0–5, one decimal; null if not set. */
    private Double averageRating;

    @Data
    @Builder
    public static class CountryResponse {
        private String isoCode;
        private String countryName;
        private String currencyCode;
        private String currencyName;
    }
}