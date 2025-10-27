package com.univoyage.auth.user;

import lombok.*;
import java.time.Instant;
import java.util.List;

@Value
@Builder
public class UserDto {
    Long id;
    String name;
    String email;
    String role;
    String country;
    List<String> hobbies;
    List<String> languages;
    List<String> visited;
    Instant dateOfRegister;
    Instant dateOfLastSignin;
    String profileImage;

    public static UserDto from(UserEntity entity) {
        return UserDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .email(entity.getEmail())
                .role(entity.getRole())
                .country(entity.getCountry())
                .hobbies(entity.getHobbies())
                .languages(entity.getLanguages())
                .visited(entity.getVisited())
                .dateOfRegister(entity.getDateOfRegister())
                .dateOfLastSignin(entity.getDateOfLastSignin())
                .profileImage(null)
                .build();
    }

}