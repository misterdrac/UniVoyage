package com.univoyage.admin.language.dto;

import jakarta.validation.constraints.Size;

public record AdminPatchLanguageRequest(@Size(max = 50) String langName,
    @Size(max = 32) String emoji, Integer sortOrder, Boolean active) {
}
