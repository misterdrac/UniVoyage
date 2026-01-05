package com.univoyage.user.model;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

/**
 * Composite key class for UserLanguage entity.
 */
@Embeddable
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode
public class UserLanguageId implements Serializable {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "lang_code")
    private String langCode;
}

