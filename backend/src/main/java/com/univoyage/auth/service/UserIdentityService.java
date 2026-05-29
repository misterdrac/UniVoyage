package com.univoyage.auth.service;

import com.univoyage.auth.model.UserIdentity;
import com.univoyage.user.model.UserEntity;

import java.util.List;
import java.util.Optional;

/**
 * Thin service layer for managing {@link UserIdentity} records.
 *
 * Business rules that span multiple providers (account-linking, verified-email
 * policies) are intentionally deferred to later tasks; this interface exposes
 * only the primitives required by Issue #242.
 */
public interface UserIdentityService {

  /**
   * Create and persist a new identity row linking {@code user} to the given
   * provider subject.
   *
   * @param user
   *          the owning user
   * @param provider
   *          provider key, e.g. "google"
   * @param providerSubject
   *          immutable subject ID from the provider
   * @param providerEmail
   *          email returned by the provider (may be null)
   * @param emailVerified
   *          whether the provider has verified that email
   * @return the persisted {@link UserIdentity}
   * @throws com.univoyage.auth.exception.IdentityAlreadyLinkedException
   *           if (provider, providerSubject) already exists
   */
  UserIdentity createIdentity(UserEntity user, String provider, String providerSubject,
      String providerEmail, boolean emailVerified);

  /**
   * Find an existing identity by provider + subject. Returns empty when the
   * subject has never signed in via this provider.
   */
  Optional<UserIdentity> findByProviderAndSubject(String provider, String providerSubject);

  /**
   * List all provider identities for a user. Useful for account-management and
   * linking-status checks.
   */
  List<UserIdentity> listIdentitiesForUser(Long userId);
}
