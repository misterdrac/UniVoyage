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
    private String imageUrl;
    private String imageAlt;
    private String overview;
    private Integer budgetPerDay;
    private String whyVisit;
    private List<String> studentPerks;
    /** ISO 3166-1 alpha-2; null if not linked to a country. */
    private String countryIsoCode;
}