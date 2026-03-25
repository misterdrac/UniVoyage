package com.univoyage.admin.destination.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Request DTO for creating a new destination in the admin panel.
 * Contains fields for destination details with validation constraints.
 */
public record AdminCreateDestinationRequest(
        @NotBlank @Size(max = 200) String name,
        @NotBlank @Size(max = 100) String location,
        @NotBlank @Size(max = 50) String continent,

        String imageUrl,
        String imageAlt,
        String overview,
        Integer budgetPerDay,
        String whyVisit,
        List<String> studentPerks,
        @Size(min = 2, max = 2) String countryIsoCode
) {}