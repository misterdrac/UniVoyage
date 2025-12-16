package com.univoyage.reference.hobby.dto;

import com.univoyage.auth.user.relations.Hobby;
import lombok.*;

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
