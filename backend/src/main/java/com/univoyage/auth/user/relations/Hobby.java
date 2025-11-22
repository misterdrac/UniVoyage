package com.univoyage.auth.user.relations;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "hobbies")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Hobby {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hobby_name"
    nullable =false,unique =true length =100)
    private String hobbyName;

    @OneToMany(mappedBy = "hobby", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    private Set<UserHobby> userHobbies;
}