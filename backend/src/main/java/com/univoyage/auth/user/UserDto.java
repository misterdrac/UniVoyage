package com.univoyage.auth.user;


import com.univoyage.user.hobby.HobbyDto;
import com.univoyage.user.language.LanguageDto;
import com.univoyage.user.visited.VisitedCoutriesDto;

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
    String country;
    List<HobbyDto> hobbies;
    List<LanguageDto> languages;
    List<VisitedCoutriesDto> visited;
    Instant dateOfRegister;
    Instant dateOfLastSignin;
    //String profileImage;

    public static UserDto from(UserEntity entity) {
        return UserDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .surname(entity.getSurname())
                .email(entity.getEmail())
                .role(entity.getRole())
                .country(entity.getCountry())
                // Mapping relationships: convert Entity lists to DTO lists
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
                //.profileImage(null) -> NOT TRANSFERRING BYTE[], REASON FOR NOT MAPPING
                .build();
    }

}