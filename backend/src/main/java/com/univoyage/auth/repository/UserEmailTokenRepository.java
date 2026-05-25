package com.univoyage.auth.repository;

import com.univoyage.auth.model.UserEmailToken;
import com.univoyage.auth.password.UserEmailTokenPurpose;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface UserEmailTokenRepository extends JpaRepository<UserEmailToken, Long> {

  @Query("""
      SELECT t FROM UserEmailToken t
      WHERE LOWER(t.email) = LOWER(:email)
        AND t.purpose = :purpose
        AND t.consumedAt IS NULL
        AND t.invalidatedAt IS NULL
      """)
  Optional<UserEmailToken> findActiveToken(@Param("email") String email,
      @Param("purpose") UserEmailTokenPurpose purpose);

  Optional<UserEmailToken> findByTokenHash(String tokenHash);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query("""
      UPDATE UserEmailToken t
      SET t.invalidatedAt = :now
      WHERE LOWER(t.email) = LOWER(:email)
        AND t.purpose = :purpose
        AND t.consumedAt IS NULL
        AND t.invalidatedAt IS NULL
      """)
  int invalidateActiveTokens(@Param("email") String email,
      @Param("purpose") UserEmailTokenPurpose purpose, @Param("now") Instant now);
}
