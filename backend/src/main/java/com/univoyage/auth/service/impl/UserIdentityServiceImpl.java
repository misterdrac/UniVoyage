package com.univoyage.auth.service.impl;

import com.univoyage.auth.exception.IdentityAlreadyLinkedException;
import com.univoyage.auth.model.UserIdentity;
import com.univoyage.auth.repository.UserIdentityRepository;
import com.univoyage.auth.service.UserIdentityService;
import com.univoyage.user.model.UserEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Default implementation of {@link UserIdentityService}.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserIdentityServiceImpl implements UserIdentityService {

    private final UserIdentityRepository userIdentityRepository;

    /**
     * {@inheritDoc}
     *
     * Guards against duplicate (provider, providerSubject) before persisting.
     * The DB unique constraint is the authoritative guard; this check avoids
     * a round-trip exception for the happy path.
     */
    @Override
    @Transactional
    public UserIdentity createIdentity(UserEntity user,
                                       String provider,
                                       String providerSubject,
                                       String providerEmail,
                                       boolean emailVerified) {

        if (userIdentityRepository.existsByProviderAndProviderSubject(provider, providerSubject)) {
            log.warn("Attempted to create duplicate identity for provider={} subject={}",
                    provider, providerSubject);
            throw new IdentityAlreadyLinkedException(provider, providerSubject);
        }

        UserIdentity identity = UserIdentity.builder()
                .user(user)
                .provider(provider)
                .providerSubject(providerSubject)
                .providerEmail(providerEmail)
                .emailVerified(emailVerified)
                .build();

        UserIdentity saved = userIdentityRepository.save(identity);
        log.info("Created identity id={} provider={} userId={}", saved.getId(), provider, user.getId());
        return saved;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<UserIdentity> findByProviderAndSubject(String provider, String providerSubject) {
        return userIdentityRepository.findByProviderAndProviderSubject(provider, providerSubject);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public List<UserIdentity> listIdentitiesForUser(Long userId) {
        return userIdentityRepository.findAllByUserId(userId);
    }
}
