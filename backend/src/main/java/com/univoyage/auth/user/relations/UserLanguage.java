package com.univoyage.auth.user.relations;

import com.univoyage.auth.user.UserEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_languages")
@IdClass(UserLanguageId.class)
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserLanguage {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lang_code", nullable = false)
    private Language language;
}