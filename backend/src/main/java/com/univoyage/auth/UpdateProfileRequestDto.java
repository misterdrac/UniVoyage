package com.univoyage.auth.dto;

import lombok.Data;
import java.util.Set;

@Data
public class UpdateProfileRequestDto {

    private String name;
    private String surname;

    // country ISO code (e.g. "HR")
    private String countryCode;

    // list of hobby IDs user selected
    private Set<Long> hobbyIds;

    // language code list (e.g. ["HR", "EN", "DE"])
    private Set<String> languageCodes;

    // visited countries as ISO codes
    private Set<String> visitedCountryCodes;
}

