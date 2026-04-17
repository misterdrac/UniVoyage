package com.univoyage.admin.review.dto;

import java.util.List;

public record AdminPendingReviewPageResponse(
        List<AdminPendingReviewResponse> content,
        long totalElements,
        int totalPages,
        int size,
        int number
) {}
