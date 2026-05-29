package com.univoyage.auth.oauth;

import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.model.UserIdentity;
import com.univoyage.auth.security.JwtService;
import com.univoyage.auth.service.AuthSignInMethodService;
import com.univoyage.auth.service.UserIdentityService;
import com.univoyage.user.dto.UserDto;
import com.univoyage.user.model.Role;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * Shared pipeline: resolve local user via provider identity (or email), persist
 * identity link when new, and issue app JWT + CSRF secret.
 */
@Service
@RequiredArgsConstructor
public class OAuthLoginCompletionService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final UserIdentityService userIdentityService;
  private final AuthSignInMethodService authSignInMethodService;

  @Transactional
  public AuthPayload completeLogin(NormalizedOAuthProfile profile) {
    UserEntity user = resolveUser(profile);
    authSignInMethodService.record(user, profile.provider().name().toLowerCase());
    JwtService.TokenPair pair = jwtService.generateForUser(user);
    return AuthPayload.ok(UserDto.from(user), pair.jwt(), pair.csrfSecret());
  }

  private UserEntity resolveUser(NormalizedOAuthProfile profile) {
    String provider = profile.provider().name().toLowerCase();
    String subject = profile.subject();

    Optional<UserIdentity> existingIdentity = userIdentityService.findByProviderAndSubject(provider,
        subject);
    if (existingIdentity.isPresent()) {
      return touchExistingUser(existingIdentity.get().getUser(), profile);
    }

    UserEntity user = findOrCreateUserByEmail(profile);
    userIdentityService.createIdentity(user, provider, subject, profile.email(),
        profile.emailVerified());
    return user;
  }

  private UserEntity touchExistingUser(UserEntity user, NormalizedOAuthProfile profile) {
    user.setDateOfLastSignin(Instant.now());
    if (profile.emailVerified() && user.getEmailVerifiedAt() == null) {
      user.setEmailVerifiedAt(Instant.now());
    }

    if (user.getName() == null || user.getName().isBlank()) {
      user.setName(profile.givenName());
    }
    if (user.getSurname() == null || user.getSurname().isBlank()) {
      user.setSurname(profile.familyName());
    }

    return userRepository.save(user);
  }

  private UserEntity findOrCreateUserByEmail(NormalizedOAuthProfile profile) {
    Optional<UserEntity> existing = userRepository.findByEmail(profile.email());

    if (existing.isPresent()) {
      return touchExistingUser(existing.get(), profile);
    }

    String randomPassword = UUID.randomUUID().toString();
    String passwordHash = passwordEncoder.encode(randomPassword);

    Instant now = Instant.now();
    UserEntity u = UserEntity.builder().email(profile.email()).name(profile.givenName())
        .surname(profile.familyName()).passwordHash(passwordHash).dateOfRegister(now)
        .dateOfLastSignin(now).emailVerifiedAt(profile.emailVerified() ? now : null).role(Role.USER)
        .build();

    return userRepository.save(u);
  }
}
