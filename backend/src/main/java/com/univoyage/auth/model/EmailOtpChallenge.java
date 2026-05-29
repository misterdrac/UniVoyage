package com.univoyage.auth.model;

import com.univoyage.auth.otp.EmailOtpPurpose;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "email_otp_challenges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailOtpChallenge {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 150)
  private String email;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private EmailOtpPurpose purpose;

  @Column(name = "otp_hash", nullable = false)
  private String otpHash;

  @Column(name = "expires_at", nullable = false)
  private Instant expiresAt;

  @Builder.Default
  @Column(name = "attempt_count", nullable = false)
  private int attemptCount = 0;

  @Column(name = "max_attempts", nullable = false)
  private int maxAttempts;

  @Builder.Default
  @Column(name = "resend_count", nullable = false)
  private int resendCount = 0;

  @Column(name = "max_resends", nullable = false)
  private int maxResends;

  @Column(name = "last_sent_at", nullable = false)
  private Instant lastSentAt;

  @Column(name = "next_resend_at", nullable = false)
  private Instant nextResendAt;

  @Column(name = "consumed_at")
  private Instant consumedAt;

  @Column(name = "locked_until")
  private Instant lockedUntil;

  @Column(name = "invalidated_at")
  private Instant invalidatedAt;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @PrePersist
  void onCreate() {
    Instant now = Instant.now();
    if (createdAt == null) {
      createdAt = now;
    }
    if (updatedAt == null) {
      updatedAt = now;
    }
  }

  @PreUpdate
  void onUpdate() {
    updatedAt = Instant.now();
  }

  public boolean isActiveAt(Instant now) {
    return consumedAt == null && invalidatedAt == null && expiresAt.isAfter(now)
        && (lockedUntil == null || !lockedUntil.isAfter(now));
  }
}
