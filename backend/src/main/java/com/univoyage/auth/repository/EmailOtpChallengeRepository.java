package com.univoyage.auth.repository;

import com.univoyage.auth.model.EmailOtpChallenge;
import com.univoyage.auth.otp.EmailOtpPurpose;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface EmailOtpChallengeRepository extends JpaRepository<EmailOtpChallenge, Long> {

  @Query("""
      SELECT c FROM EmailOtpChallenge c
      WHERE LOWER(c.email) = LOWER(:email)
        AND c.purpose = :purpose
        AND c.consumedAt IS NULL
        AND c.invalidatedAt IS NULL
      """)
  Optional<EmailOtpChallenge> findActiveChallenge(@Param("email") String email,
      @Param("purpose") EmailOtpPurpose purpose);

  @Modifying
  @Query("""
      UPDATE EmailOtpChallenge c
      SET c.invalidatedAt = :now, c.updatedAt = :now
      WHERE LOWER(c.email) = LOWER(:email)
        AND c.purpose = :purpose
        AND c.consumedAt IS NULL
        AND c.invalidatedAt IS NULL
      """)
  int invalidateActiveChallenges(@Param("email") String email,
      @Param("purpose") EmailOtpPurpose purpose, @Param("now") Instant now);

  Optional<EmailOtpChallenge> findTopByEmailIgnoreCaseAndPurposeOrderByCreatedAtDesc(String email,
      EmailOtpPurpose purpose);
}
