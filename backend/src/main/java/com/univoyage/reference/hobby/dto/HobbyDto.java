package com.univoyage.reference.hobby.dto;

import com.univoyage.reference.hobby.model.Hobby;
import lombok.*;

/**
 * Data Transfer Object for Hobby entity.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HobbyDto {
    private Long id;
    private String hobbyName;

    public static HobbyDto from(Hobby entity) {
        if (entity == null) return null;
        return HobbyDto.builder()
                .id(entity.getId())
                .hobbyName(entity.getHobbyName())
                .build();
    }
}
