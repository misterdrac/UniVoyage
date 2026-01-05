package com.univoyage.reference.country.dto;

import com.univoyage.reference.country.model.Country;
import lombok.*;

/**
 * Data Transfer Object for Country entity.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CountryDto {

    private String isoCode;
    private String countryName;

    public static CountryDto from(Country entity) {
        if (entity == null) return null;
        return CountryDto.builder()
                .isoCode(entity.getIsoCode())
                .countryName(entity.getCountryName())
                .build();
    }
}
