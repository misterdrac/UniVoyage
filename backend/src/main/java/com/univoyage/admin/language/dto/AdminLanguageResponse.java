package com.univoyage.admin.language.dto;

public record AdminLanguageResponse(String langCode, String langName, String emoji,
    Integer sortOrder, boolean active) {
}
