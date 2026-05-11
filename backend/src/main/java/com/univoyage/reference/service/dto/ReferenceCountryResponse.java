package com.univoyage.reference.service.dto;

public record ReferenceCountryResponse(String isoCode, String countryName, String currencyCode,
    String currencyName, Integer sortOrder) {
}
