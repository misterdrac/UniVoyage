package com.univoyage.auth.user.dto;

import com.univoyage.auth.user.relations.Country;
import lombok.*;

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
