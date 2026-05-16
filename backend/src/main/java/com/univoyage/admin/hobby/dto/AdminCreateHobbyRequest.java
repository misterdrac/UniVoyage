package com.univoyage.admin.hobby.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminCreateHobbyRequest(
    @NotBlank @Size(max = 50) @Pattern(regexp = "[a-z][a-z0-9_]{0,49}", message = "hobbyName must be lowercase slug") String hobbyName,
    @NotBlank @Size(max = 120) String displayLabel, @NotBlank @Size(max = 32) String emoji) {
}
