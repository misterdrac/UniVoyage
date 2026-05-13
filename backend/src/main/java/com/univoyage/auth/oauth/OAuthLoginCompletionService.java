package com.univoyage.auth.oauth;

import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.security.JwtService;
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
 * Shared pipeline: persist / update local user from normalized OAuth claims and issue app JWT +
 * CSRF secret.
 */
@Service
@RequiredArgsConstructor
public class OAuthLoginCompletionService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  @Transactional
  public AuthPayload completeLogin(NormalizedOAuthProfile profile) {
    UserEntity user = findOrCreateUser(profile);
    JwtService.TokenPair pair = jwtService.generateForUser(user);
    return AuthPayload.ok(UserDto.from(user), pair.jwt(), pair.csrfSecret());
  }

  private UserEntity findOrCreateUser(NormalizedOAuthProfile profile) {
    Optional<UserEntity> existing = userRepository.findByEmail(profile.email());

    if (existing.isPresent()) {
      UserEntity u = existing.get();
      u.setDateOfLastSignin(Instant.now());

      if (u.getName() == null || u.getName().isBlank()) {
        u.setName(profile.givenName());
      }
      if (u.getSurname() == null || u.getSurname().isBlank()) {
        u.setSurname(profile.familyName());
      }

      return userRepository.save(u);
    }

    String randomPassword = UUID.randomUUID().toString();
    String passwordHash = passwordEncoder.encode(randomPassword);

    UserEntity u = UserEntity.builder().email(profile.email()).name(profile.givenName())
        .surname(profile.familyName()).passwordHash(passwordHash).dateOfRegister(Instant.now())
        .dateOfLastSignin(Instant.now()).role(Role.USER).build();

    return userRepository.save(u);
  }
}
