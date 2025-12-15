package com.univoyage.auth.user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

// Repository interface for UserEntity - provides methods to interact with the database
// method is parsed by Spring Data JPA to generate SQL queries
// methods are called on Service layer to check for existing users and retrieve user data
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByEmail(String email);
    boolean existsByEmail(String email);
}