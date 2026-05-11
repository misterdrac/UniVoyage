package com.univoyage.admin.country.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminCreateCountryRequest(
    @NotBlank @Size(min = 2, max = 2) @Pattern(regexp = "[A-Z]{2}") String isoCode,
    @NotBlank @Size(max = 100) String countryName,
    @NotBlank @Size(min = 3, max = 3) @Pattern(regexp = "[A-Za-z]{3}") String currencyCode,
    @Size(max = 100) String currencyName) {
}
