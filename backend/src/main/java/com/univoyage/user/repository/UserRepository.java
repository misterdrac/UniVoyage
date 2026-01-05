package com.univoyage.user.repository;

import com.univoyage.user.model.UserEntity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * Repository interface for UserEntity.
 */
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("""
        SELECT u FROM UserEntity u
        WHERE lower(u.email) LIKE concat('%', :q, '%')
           OR lower(u.name) LIKE concat('%', :q, '%')
           OR lower(u.surname) LIKE concat('%', :q, '%')
    """)
    Page<UserEntity> searchAdminUsers(@Param("q") String q, Pageable pageable);
}
