package com.univoyage.auth.user.dto;

import com.univoyage.auth.user.relations.UserVisitedCountry;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate; // Import for LocalDate

@Data @Builder
public class VisitedCountryDto {

    private String isoCode;
    private String countryName;
    private LocalDate dateOfVisit;

    // Static method to map Entity to DTO
    public static VisitedCountryDto from(UserVisitedCountry entity) {
        return VisitedCountryDto.builder()
                // Accessing data from the nested Country entity
                .isoCode(entity.getCountry().getIsoCode())
                .countryName(entity.getCountry().getCountryName())

                // Accessing data from the junction entity itself
                .dateOfVisit(entity.getDateOfVisit())
                .build();
    }
}