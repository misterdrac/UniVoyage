package com.univoyage.admin.destination.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Request DTO for updating an existing destination in the admin panel.
 * Contains fields for destination details with validation constraints.
 */
public record AdminUpdateDestinationRequest(
        @NotBlank @Size(max = 200) String name,
        @NotBlank @Size(max = 100) String location,
        @NotBlank @Size(max = 50) String continent,
        @NotBlank @Size(min = 2, max = 2) String countryCode,

        String imageUrl,
        String imageAlt,
        String overview,
        Integer budgetPerDay,
        String whyVisit,
        @NotNull List<String> studentPerks,
        @DecimalMin(value = "0.0", inclusive = true) @DecimalMax(value = "5.0", inclusive = true) Double averageRating
) {}
