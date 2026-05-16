package com.univoyage.reference.service.dto;

public record ReferenceLanguageResponse(String langCode, String langName, String emoji,
    Integer sortOrder) {
}
