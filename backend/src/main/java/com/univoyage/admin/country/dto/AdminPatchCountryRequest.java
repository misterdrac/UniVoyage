package com.univoyage.admin.country.dto;

import jakarta.validation.constraints.Size;

public record AdminPatchCountryRequest(@Size(max = 100) String countryName, @Size(max = 3) String currencyCode,
    @Size(max = 100) String currencyName, Integer sortOrder, Boolean active) {
}
