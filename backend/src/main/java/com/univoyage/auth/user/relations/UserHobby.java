package com.univoyage.auth.user.relations;

import com.univoyage.auth.user.UserEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_hobbies")
@IdClass(UserHobbyId.class)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@ToString
public class UserHobby {

    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    @ToString.Exclude
    private UserEntity user;

    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hobby_id")
    private Hobby hobby;
}