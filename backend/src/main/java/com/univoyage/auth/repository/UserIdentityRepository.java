package com.univoyage.auth.repository;

import com.univoyage.auth.model.UserIdentity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for {@link UserIdentity}.
 *
 * Key queries:
 * <ul>
 *   <li>Find by (provider, providerSubject) — used on every OAuth callback.</li>
 *   <li>List all identities for a user — used for account-management views.</li>
 * </ul>
 */
public interface UserIdentityRepository extends JpaRepository<UserIdentity, Long> {

    /**
     * Look up an existing identity by provider + provider-issued subject.
     * Returns empty when this is the first sign-in for that subject.
     */
    Optional<UserIdentity> findByProviderAndProviderSubject(String provider, String providerSubject);

    /**
     * Return all provider identities linked to a given user.
     */
    List<UserIdentity> findAllByUserId(Long userId);

    /**
     * Check whether a specific (provider, subject) pair is already linked.
     * Useful for guard checks without loading the full entity.
     */
    boolean existsByProviderAndProviderSubject(String provider, String providerSubject);
}
