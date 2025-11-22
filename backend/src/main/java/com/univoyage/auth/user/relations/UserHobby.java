package com.univoyage.user.hobby;

import com.univoyage.auth.user.UserEntity;
import jakarta.persistence.*;
import lombok.*;

// Composite key is mandatory for the Many-to-Many junction table
@Entity
@Table(name = "user_hobbies")
@IdClass(UserHobbyId.class)
@Data @NoArgsConstructor @AllArgsConstructor @Builder
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