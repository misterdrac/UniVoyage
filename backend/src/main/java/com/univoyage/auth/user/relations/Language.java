package com.univoyage.user.language;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "languages")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Language {

    @Id
    @Column(name = "lang_code", length = 2) // Primary Key is the 2-char code
    private String langCode;

    @Column(name = "lang_name", unique = true, nullable = false, length = 50)
    private String langName;

    @OneToMany(mappedBy = "language", fetch = FetchType.LAZY)
    @ToString.Exclude
    private Set<UserLanguage> userLanguages;
}