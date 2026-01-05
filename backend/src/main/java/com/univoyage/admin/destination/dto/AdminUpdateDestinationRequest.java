package com.univoyage.admin.destination.dto;

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

        String imageUrl,
        String imageAlt,
        String overview,
        Integer budgetPerDay,
        String whyVisit,
        @NotNull List<String> studentPerks
) {}
