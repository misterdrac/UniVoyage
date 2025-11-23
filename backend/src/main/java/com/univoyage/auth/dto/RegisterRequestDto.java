package com.univoyage.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Value;

import java.util.Set;

@Value
public class RegisterRequestDto {

    @NotBlank
    @Size(max = 150)
    String name;

    @NotBlank
    @Size(max = 150)
    String surname;

    @NotBlank
    @Email
    @Size(max = 150)
    String email;

    @NotBlank
    @Size(min = 8, message = "Password must be at least 8 characters long")
    String password;

    @NotBlank
    @Size(min = 2, max = 2, message = "Country code must be 2 characters long (ISO alpha-2)")
    String countryCode;

    Set<Long> hobbyIds;
    Set<Long> languageIds;

    // Updated to use 2-character codes
    Set<@Size(min = 2, max = 2) String> visitedCountryCodes;
}