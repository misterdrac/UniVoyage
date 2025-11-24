package com.univoyage.auth.user.relations;

import jakarta.persistence.Column;
import lombok.*;

import java.io.Serializable;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode
public class UserLanguageId implements Serializable {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "lang_code")
    private String langCode;
}
