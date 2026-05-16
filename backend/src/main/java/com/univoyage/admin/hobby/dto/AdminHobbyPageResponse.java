package com.univoyage.admin.hobby.dto;

import java.util.List;

public record AdminHobbyPageResponse(List<AdminHobbyResponse> content, long totalElements,
    int totalPages, int size, int number) {
}
