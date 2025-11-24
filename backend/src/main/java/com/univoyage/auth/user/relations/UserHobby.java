package com.univoyage.auth.user.relations;

import com.univoyage.auth.user.UserEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_hobbies")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@IdClass(UserHobbyId.class)
public class UserHobby {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hobby_id", nullable = false)
    private Hobby hobby;
}
