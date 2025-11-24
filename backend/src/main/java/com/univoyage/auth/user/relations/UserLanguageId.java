package com.univoyage.auth.user.relations;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class UserLanguageId implements java.io.Serializable {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "lang_code")
    private String langCode;
}

