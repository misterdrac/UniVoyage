package com.univoyage.user.dto;

import jakarta.validation.constraints.Pattern;
import lombok.Data;
import java.util.Set;

/**
 * Request DTO for updating user profile information.
 */
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

    // profile image path (avatar URL) - must be from allowed CDN with avatar number 1-20
    @Pattern(
        regexp = "^https://cdn\\.shadcnstudio\\.com/ss-assets/avatar/avatar-(1[0-9]|20|[1-9])\\.png$",
        message = "Profile image path must be a valid avatar URL (avatar-1.png to avatar-20.png)"
    )
    private String profileImagePath;
}

