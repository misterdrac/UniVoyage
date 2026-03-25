package com.univoyage.admin.destination.dto;

import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Request DTO for patching an existing destination in the admin panel.
 * Contains fields for destination details that can be updated.
 */
public record AdminPatchDestinationRequest(
        String name,
        String location,
        String continent,
        String imageUrl,
        String imageAlt,
        String overview,
        Integer budgetPerDay,
        String whyVisit,
        List<String> studentPerks,
        @Size(min = 2, max = 2) String countryIsoCode
) {}
