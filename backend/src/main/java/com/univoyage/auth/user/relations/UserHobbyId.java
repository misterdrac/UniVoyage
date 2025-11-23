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
public class UserHobbyId implements Serializable {

    // Ensure the column names here match the columns in the UserHobby table DDL
    // and match the field names in the UserHobby Entity.

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "hobby_id")
    private Long hobbyId;
}