package com.univoyage.reference.language.dto;

import com.univoyage.reference.language.model.Language;
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
