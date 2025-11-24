package com.univoyage.auth.user.relations;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "hobbies")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@ToString
public class Hobby {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // BIGINT IDENTITY
    private Long id;

    @Column(name = "hobby_name", nullable = false, unique = true, length = 50)
    private String hobbyName;

}
