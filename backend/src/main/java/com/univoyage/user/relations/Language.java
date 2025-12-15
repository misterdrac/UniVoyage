package com.univoyage.auth.user.relations;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "languages")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Language {

    @Id
    @Column(name = "lang_code", length = 2) // Primary Key is the 2-char code
    private String langCode;

    @Column(name = "lang_name", unique = true, nullable = false, length = 50)
    private String langName;

}