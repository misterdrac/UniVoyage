package com.univoyage.user.model;

import com.univoyage.user.model.UserEntity;
import com.univoyage.reference.language.model.Language;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity representing the association between a user and a language they speak.
 */
@Entity
@Table(name = "user_languages")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class UserLanguage {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private UserLanguageId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name="user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("langCode")
    @JoinColumn(name="lang_code", nullable = false)
    private Language language;

    public static UserLanguage of(UserEntity user, Language lang) {
        return UserLanguage.builder()
                .id(new UserLanguageId(user.getId(), lang.getLangCode()))
                .user(user)
                .language(lang)
                .build();
    }
}