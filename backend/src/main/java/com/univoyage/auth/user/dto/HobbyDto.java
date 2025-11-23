package com.univoyage.auth.user.dto;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class HobbyDto {
    private Long id;
    private String hobbyName;

    // Static method to map Entity to DTO
    public static HobbyDto from(com.univoyage.auth.user.relations.Hobby entity) {
        return HobbyDto.builder()
                .id(entity.getId())
                .hobbyName(entity.getHobbyName())
                .build();
    }
}