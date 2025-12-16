package com.univoyage.user.model;

import com.univoyage.user.model.UserEntity;
import com.univoyage.reference.hobby.model.Hobby;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_hobbies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class UserHobby {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private UserHobbyId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId") // maps id.userId → user.id
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("hobbyId") // maps id.hobbyId → hobby.id
    @JoinColumn(name = "hobby_id", nullable = false)
    @ToString.Exclude
    private Hobby hobby;

    // Factory method - najbolji način da kreiraš ovaj entitet
    public static UserHobby of(UserEntity user, Hobby hobby) {
        UserHobbyId key = new UserHobbyId(user.getId(), hobby.getId());

        UserHobby entity = new UserHobby();
        entity.setId(key);
        entity.setUser(user);
        entity.setHobby(hobby);

        return entity;
    }
}