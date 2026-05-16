package com.univoyage.auth.service;

import com.univoyage.auth.exception.IdentityAlreadyLinkedException;
import com.univoyage.auth.model.UserIdentity;
import com.univoyage.user.model.Role;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class UserIdentityServiceTest {

  @Autowired
  private UserIdentityService userIdentityService;

  @Autowired
  private UserRepository userRepository;

  private UserEntity savedUser;

  @BeforeEach
  void setUp() {
    savedUser = userRepository.save(UserEntity.builder().name("Test").surname("User")
        .email("test_identity_svc_" + System.currentTimeMillis() + "@example.com")
        .passwordHash("$2a$10$hashedpassword").role(Role.USER).dateOfRegister(Instant.now())
        .build());
  }

  @Test
  void createIdentity_persistsAndReturnsIdentity() {
    UserIdentity created = userIdentityService.createIdentity(savedUser, "google", "g-sub-100",
        "user@gmail.com", true);

    assertThat(created.getId()).isNotNull();
    assertThat(created.getProvider()).isEqualTo("google");
    assertThat(created.getProviderSubject()).isEqualTo("g-sub-100");
    assertThat(created.isEmailVerified()).isTrue();
  }

  @Test
  void createIdentity_throwsWhenProviderSubjectAlreadyLinked() {
    userIdentityService.createIdentity(savedUser, "google", "dup-subject", null, false);

    assertThatThrownBy(
        () -> userIdentityService.createIdentity(savedUser, "google", "dup-subject", null, false))
        .isInstanceOf(IdentityAlreadyLinkedException.class).hasMessageContaining("provider=google")
        .hasMessageContaining("subject=dup-subject");
  }

  @Test
  void findByProviderAndSubject_returnsExistingIdentity() {
    userIdentityService.createIdentity(savedUser, "github", "gh-77", null, false);

    Optional<UserIdentity> found = userIdentityService.findByProviderAndSubject("github", "gh-77");

    assertThat(found).isPresent();
    assertThat(found.get().getUser().getId()).isEqualTo(savedUser.getId());
  }

  @Test
  void listIdentitiesForUser_returnsAllLinkedProviders() {
    userIdentityService.createIdentity(savedUser, "google", "g-1", null, false);
    userIdentityService.createIdentity(savedUser, "github", "gh-1", null, false);

    List<UserIdentity> identities = userIdentityService.listIdentitiesForUser(savedUser.getId());

    assertThat(identities).hasSize(2);
    assertThat(identities).extracting(UserIdentity::getProvider).containsExactlyInAnyOrder("google",
        "github");
  }
}
