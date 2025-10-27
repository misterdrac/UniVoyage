package com.univoyage.auth.user;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.List;

// JPA Entity representing a user in the database, mapped to the "users" table
// Java object that represents a row in users table, it's ORM mapping
@Entity
@Table(name = "users")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // bigint serial/sequence/increment
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    // password will be hashed, but we don't change name to mess with ORM mapping
    @Column(name = "password", nullable = false, columnDefinition = "text")
    private String password;

    // user role is default
    @Column(nullable = false, length = 50)
    @Builder.Default
    private String role = "user";

    // Postgres text[] arrays
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private List<String> hobbies;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private List<String> languages;

    @Column(length = 100)
    private String country;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private List<String> visited;

    // bytea
    // Correct for PostgreSQL bytea
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "profile_image", columnDefinition = "bytea", nullable = true)
    private byte[] profileImage;

    // timestamptz, DB default now()
    @Column(name = "date_of_register", nullable = false, insertable = false, updatable = false)
    private Instant dateOfRegister = Instant.now();

    @Column(name = "date_of_last_signin")
    private Instant dateOfLastSignin;
}
