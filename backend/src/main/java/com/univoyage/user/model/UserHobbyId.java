package com.univoyage.user.model;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

/**
 * Composite key class for UserHobby entity.
 */
@Embeddable
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode
public class UserHobbyId implements Serializable {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "hobby_id")
    private Long hobbyId;
}