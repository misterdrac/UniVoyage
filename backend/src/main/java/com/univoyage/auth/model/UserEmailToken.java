package com.univoyage.auth.model;

import com.univoyage.auth.password.UserEmailTokenPurpose;
import com.univoyage.user.model.UserEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "user_email_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEmailToken {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private UserEntity user;

  @Column(nullable = false, length = 150)
  private String email;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private UserEmailTokenPurpose purpose;

  @Column(name = "token_hash", nullable = false)
  private String tokenHash;

  @Column(name = "expires_at", nullable = false)
  private Instant expiresAt;

  @Builder.Default
  @Column(name = "attempt_count", nullable = false)
  private int attemptCount = 0;

  @Builder.Default
  @Column(name = "max_attempts", nullable = false)
  private int maxAttempts = 5;

  @Column(name = "consumed_at")
  private Instant consumedAt;

  @Column(name = "invalidated_at")
  private Instant invalidatedAt;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  public boolean isActiveAt(Instant now) {
    return consumedAt == null && invalidatedAt == null && expiresAt.isAfter(now);
  }
}
