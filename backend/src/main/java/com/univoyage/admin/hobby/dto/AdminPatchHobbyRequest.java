package com.univoyage.admin.hobby.dto;

import jakarta.validation.constraints.Size;

public record AdminPatchHobbyRequest(
    @Size(max = 50) String hobbyName,
    @Size(max = 120) String displayLabel,
    @Size(max = 32) String emoji,
    Integer sortOrder,
    Boolean active) {
}
