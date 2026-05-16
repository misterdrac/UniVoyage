package com.univoyage.admin.country.dto;

import java.util.List;

public record AdminCountryPageResponse(List<AdminCountryResponse> content, long totalElements,
    int totalPages, int size, int number) {
}
