package com.univoyage.auth.user.dto;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class LanguageDto {
    private String langCode;
    private String langName;


    // Static method to map Entity to DTO
    public static LanguageDto from(com.univoyage.auth.user.relations.Language entity) {
        return LanguageDto.builder()
                .langCode(entity.getLangCode())
                .langName(entity.getLangName())
                .build();
    }
}