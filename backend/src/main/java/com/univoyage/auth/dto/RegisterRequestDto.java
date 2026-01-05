package com.univoyage.auth.dto;

import lombok.Data;
import java.util.Set;

/**
 * Request DTO for user registration.
 * Contains fields for user credentials and profile information.
 */
@Data
public class RegisterRequestDto {

    private String email;
    private String password;

    private String name;
    private String surname;

    private String countryCode;

    private Set<Long> hobbyIds;

    private Set<String> languageCodes;

    private Set<String> visitedCountryCodes;
}
