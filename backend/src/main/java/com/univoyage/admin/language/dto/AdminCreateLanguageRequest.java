package com.univoyage.admin.language.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminCreateLanguageRequest(
    @NotBlank @Size(min = 2, max = 2) @Pattern(regexp = "[a-z]{2}") String langCode,
    @NotBlank @Size(max = 50) String langName) {
}
