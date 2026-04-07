package com.univoyage.admin.destination.dto;

import java.util.List;

/**
 * Stable JSON shape for paginated admin destinations (avoids serializing Spring Data {@code PageImpl}).
 */
public record AdminDestinationPageResponse(
        List<AdminDestinationResponse> content,
        long totalElements,
        int totalPages,
        int size,
        int number
) {}
