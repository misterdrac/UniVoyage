package com.univoyage.admin.destination.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AdminCreateDestinationRequest(
        @NotBlank @Size(max = 200) String name,
        @NotBlank @Size(max = 100) String location,
        @NotBlank @Size(max = 50) String continent,

        String imageUrl,
        String imageAlt,
        String overview,
        Integer budgetPerDay,
        String whyVisit,
        List<String> studentPerks
) {}