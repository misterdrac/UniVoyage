package com.univoyage.user.dto;

import com.univoyage.user.model.UserVisitedCountry;
import lombok.*;

import java.time.LocalDate;

/**
 * Data Transfer Object for a country visited by a user.
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitedCountryDto {

    private String isoCode;
    private String countryName;
    private LocalDate dateOfVisit;

    public static VisitedCountryDto from(UserVisitedCountry entity) {
        if (entity == null || entity.getCountry() == null) return null;
        return VisitedCountryDto.builder()
                .isoCode(entity.getCountry().getIsoCode())
                .countryName(entity.getCountry().getCountryName())
                .dateOfVisit(entity.getDateOfVisit())
                .build();
    }
}
