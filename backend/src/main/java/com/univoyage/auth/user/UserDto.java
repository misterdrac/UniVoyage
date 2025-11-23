package com.univoyage.auth.user;

import com.univoyage.auth.user.dto.HobbyDto;
import com.univoyage.auth.user.dto.LanguageDto;
import com.univoyage.auth.user.dto.VisitedCountryDto;
import com.univoyage.auth.user.dto.CountryDto;

import lombok.*;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Value
@Builder
public class UserDto {
    Long id;
    String name;
    String surname;
    String email;
    String role;
    CountryDto countryOfOrigin;
    List<HobbyDto> hobbies;
    List<LanguageDto> languages;
    List<VisitedCountryDto> visitedCountries;
    Instant dateOfRegister;
    Instant dateOfLastSignin;

    public static UserDto from(UserEntity entity) {
        return UserDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .surname(entity.getSurname())
                .email(entity.getEmail())
                .role(entity.getRole())
                .countryOfOrigin(entity.getCountry() != null
                        ? CountryDto.from(entity.getCountry())
                        : null)
                .hobbies(entity.getUserHobbies().stream()
                        .map(uh -> HobbyDto.from(uh.getHobby()))
                        .collect(Collectors.toList()))
                .languages(entity.getUserLanguages().stream()
                        .map(ul -> LanguageDto.from(ul.getLanguage()))
                        .collect(Collectors.toList()))
                .visitedCountries(entity.getVisitedCountries().stream()
                        .map(VisitedCountryDto::from)
                        .collect(Collectors.toList()))
                .dateOfRegister(entity.getDateOfRegister())
                .dateOfLastSignin(entity.getDateOfLastSignin())
                .build();
    }
}