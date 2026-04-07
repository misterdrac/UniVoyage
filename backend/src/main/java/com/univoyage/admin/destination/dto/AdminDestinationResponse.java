package com.univoyage.admin.destination.dto;

import java.time.Instant;
import java.util.List;

/**
 * Response DTO for destination details in the admin panel.
 * Contains all relevant fields of a destination.
 */
public record AdminDestinationResponse(
        Long id,
        String name,
        String location,
        String continent,
        String countryCode,
        String imageUrl,
        String imageAlt,
        String overview,
        Integer budgetPerDay,
        String whyVisit,
        List<String> studentPerks,
        Double averageRating,
        Instant createdAt,
        Instant updatedAt
) {}
