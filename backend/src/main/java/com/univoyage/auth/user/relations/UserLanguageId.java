package com.univoyage.auth.user.relations;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable // Marks this class as embeddable, not a standalone entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserLanguageId implements Serializable {

    // Ensure the column names here match the columns in the UserLanguage table DDL
    // and match the field names in the UserLanguage Entity.

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "language_id")
    private Long languageId;
}