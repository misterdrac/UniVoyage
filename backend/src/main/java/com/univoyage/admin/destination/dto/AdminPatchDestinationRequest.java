package com.univoyage.admin.destination.dto;

import java.util.List;

public record AdminPatchDestinationRequest(
        String name,
        String location,
        String continent,
        String imageUrl,
        String imageAlt,
        String overview,
        Integer budgetPerDay,
        String whyVisit,
        List<String> studentPerks
) {}
