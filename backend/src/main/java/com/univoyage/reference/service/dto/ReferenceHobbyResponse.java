package com.univoyage.reference.service.dto;

public record ReferenceHobbyResponse(Long id, String hobbyName, String displayLabel, String emoji,
    Integer sortOrder) {
}
