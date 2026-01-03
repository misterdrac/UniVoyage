package com.univoyage.admin.destination.dto;

import java.time.Instant;
import java.util.List;

public record AdminDestinationResponse(
        Long id,
        String name,
        String location,
        String continent,
        String imageUrl,
        String imageAlt,
        String overview,
        Integer budgetPerDay,
        String whyVisit,
        List<String> studentPerks,
        Instant createdAt,
        Instant updatedAt
) {}
