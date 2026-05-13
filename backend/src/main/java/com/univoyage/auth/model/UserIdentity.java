package com.univoyage.auth.model;

import com.univoyage.user.model.UserEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Represents a single provider identity linked to a user. One user may have
 * many identities (Google, Apple, GitHub, …). Uniqueness is enforced at the DB
 * level on (provider, providerSubject).
 */
@Entity
@Table(name = "user_identities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserIdentity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  /**
   * The owning user. LAZY – callers that need the full user must explicitly fetch
   * it.
   */
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private UserEntity user;

  /**
   * Provider identifier, e.g. "google", "apple", "github", "linkedin". Kept as a
   * plain string so new providers need no schema change.
   */
  @Column(nullable = false, length = 32)
  private String provider;

  /**
   * The immutable subject identifier issued by the provider (the "sub" claim).
   */
  @Column(name = "provider_subject", nullable = false, length = 255)
  private String providerSubject;

  /**
   * Email returned by the provider at the time of linking. May be null if the
   * provider does not expose it.
   */
  @Column(name = "provider_email", length = 150)
  private String providerEmail;

  /**
   * Whether the provider has verified this email address. Drives account-linking
   * rules in later tasks.
   */
  @Builder.Default
  @Column(name = "email_verified", nullable = false)
  private boolean emailVerified = false;

  @Builder.Default
  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  @Builder.Default
  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt = Instant.now();

  @PreUpdate
  void onUpdate() {
    this.updatedAt = Instant.now();
  }
}
