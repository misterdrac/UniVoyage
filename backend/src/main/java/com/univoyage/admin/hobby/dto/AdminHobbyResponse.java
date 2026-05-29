package com.univoyage.admin.hobby.dto;

public record AdminHobbyResponse(Long id, String hobbyName, String displayLabel, String emoji,
    Integer sortOrder, boolean active) {
}
