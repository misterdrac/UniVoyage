package com.univoyage.admin.language.dto;

import java.util.List;

public record AdminLanguagePageResponse(List<AdminLanguageResponse> content, long totalElements,
    int totalPages, int size, int number) {
}
