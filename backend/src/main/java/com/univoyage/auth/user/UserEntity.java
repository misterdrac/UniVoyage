package com.univoyage.auth.user;

import com.univoyage.auth.user.relations.UserHobby;
import com.univoyage.auth.user.relations.UserLanguage;
import com.univoyage.auth.user.relations.UserVisitedCountry;
import com.univoyage.auth.user.relations.Country;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.List;
import java.util.Set;

// JPA Entity representing a user in the database, mapped to the "users" table
// Java object that represents a row in users table, it's ORM mapping
@Entity
@Table(name = "users")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
@EqualsAndHashCode(exclude = {"userHobbies", "userLanguages", "visitedCountries", "profileImageData"}) // Important for relationships
@ToString(exclude = {"userHobbies", "userLanguages", "visitedCountries", "profileImageData"}) // Keep logs clean
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // bigint serial/sequence/increment
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    // added with new layout
    @Column(nullable = false, length = 150)
    private String surname;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    // password will be hashed, but we don't change name to mess with ORM mapping
    @Column(name = "password_hash", nullable = false, columnDefinition = "text")
    private String passwordHash;

    // user role is default
    @Column(nullable = false, length = 50)
    @Builder.Default
    private String role = "user";

    // added with new layout
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserHobby> userHobbies;

    // added with new layout
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserLanguage> userLanguages;

    // added with new layout
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_of_origin_code", referencedColumnName = "iso_code")
    private Country country;

    // added with new layout
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserVisitedCountry> visitedCountries;

    // bytea
    // Correct for PostgreSQL bytea
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "profile_image_data", columnDefinition = "bytea", nullable = true)
    private byte[] profileImageData;

    // timestamptz, DB default now()
    @Column(name = "date_of_register", nullable = false)
    private Instant dateOfRegister;

    @Column(name = "date_of_last_signin")
    private Instant dateOfLastSignin;
}