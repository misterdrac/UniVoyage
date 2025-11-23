package com.univoyage.auth.user.dto;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class CountryDto {
    private String isoCode;
    private String countryName;


    // Static method to map Entity to DTO
    public static CountryDto from(com.univoyage.auth.user.relations.Country entity) {
        return CountryDto.builder()
                .isoCode(entity.getIsoCode())
                .countryName(entity.getCountryName())
                .build();
    }
}