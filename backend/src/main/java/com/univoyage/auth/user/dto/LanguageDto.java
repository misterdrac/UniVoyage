package com.univoyage.auth.user.dto;

import com.univoyage.auth.user.relations.Language;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LanguageDto {

    private String langCode;
    private String langName;

    public static LanguageDto from(Language entity) {
        if (entity == null) return null;
        return LanguageDto.builder()
                .langCode(entity.getLangCode())
                .langName(entity.getLangName())
                .build();
    }
}
