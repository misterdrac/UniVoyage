package com.univoyage.user.dto;

import com.univoyage.user.model.UserEntity;
import com.univoyage.reference.country.dto.CountryDto;
import com.univoyage.reference.hobby.dto.HobbyDto;
import com.univoyage.reference.language.dto.LanguageDto;

import lombok.*;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {

    private Long id;
    private String name;
    private String surname;
    private String email;
    private String role;                 // role.name()
    private CountryDto countryOfOrigin;
    private List<HobbyDto> hobbies;
    private List<LanguageDto> languages;
    private List<VisitedCountryDto> visitedCountries;
    private String profileImagePath;
    private Instant dateOfRegister;
    private Instant dateOfLastSignin;

    public static UserDto from(UserEntity entity) {
        if (entity == null) return null;

        return UserDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .surname(entity.getSurname())
                .email(entity.getEmail())
                .role(entity.getRole().name())            // FIXED
                .countryOfOrigin(
                        entity.getCountry() != null
                                ? CountryDto.from(entity.getCountry())
                                : null
                )
                .hobbies(entity.getUserHobbies().stream()
                        .map(h -> HobbyDto.from(h.getHobby()))
                        .collect(Collectors.toList()))
                .languages(entity.getUserLanguages().stream()
                        .map(l -> LanguageDto.from(l.getLanguage()))
                        .collect(Collectors.toList()))
                .visitedCountries(entity.getVisitedCountries().stream()
                        .map(VisitedCountryDto::from)
                        .collect(Collectors.toList()))
                .profileImagePath(entity.getProfileImagePath())
                .dateOfRegister(entity.getDateOfRegister())
                .dateOfLastSignin(entity.getDateOfLastSignin())
                .build();
    }
}
