package com.univoyage.destination.dto;

import java.util.List;

public record DestinationReviewsPageResponse(
        List<DestinationReviewPublicResponse> content,
        long totalElements,
        int totalPages,
        int size,
        int number
) {}
