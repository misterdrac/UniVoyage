package com.univoyage.admin.country.dto;

public record AdminCountryResponse(String isoCode, String countryName, String currencyCode,
    String currencyName, Integer sortOrder, boolean active) {
}
