package com.univoyage.auth.repository;

import com.univoyage.auth.model.UserIdentity;
import com.univoyage.user.model.Role;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
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
class UserIdentityRepositoryTest {

  @Autowired
  private UserIdentityRepository userIdentityRepository;

  @Autowired
  private UserRepository userRepository;

  private UserEntity savedUser;

  @BeforeEach
  void setUp() {
    savedUser = userRepository.save(UserEntity.builder().name("Test").surname("User")
        .email("test_identity_" + System.currentTimeMillis() + "@example.com")
        .passwordHash("$2a$10$hashedpassword").role(Role.USER).dateOfRegister(Instant.now())
        .build());
  }

  // ------------------------------------------------------------------ insert

  @Test
  void insert_persistsIdentityWithAllFields() {
    UserIdentity identity = userIdentityRepository.save(UserIdentity.builder().user(savedUser)
        .provider("google").providerSubject("google-subject-001").providerEmail("test@gmail.com")
        .emailVerified(true).build());

    assertThat(identity.getId()).isNotNull();
    assertThat(identity.getProvider()).isEqualTo("google");
    assertThat(identity.getProviderSubject()).isEqualTo("google-subject-001");
    assertThat(identity.isEmailVerified()).isTrue();
    assertThat(identity.getCreatedAt()).isNotNull();
  }

  // ------------------------------------------------ findByProviderAndSubject

  @Test
  void findByProviderAndProviderSubject_returnsIdentityWhenExists() {
    userIdentityRepository.save(UserIdentity.builder().user(savedUser).provider("github")
        .providerSubject("gh-subject-42").build());

    Optional<UserIdentity> found = userIdentityRepository.findByProviderAndProviderSubject("github",
        "gh-subject-42");

    assertThat(found).isPresent();
    assertThat(found.get().getUser().getId()).isEqualTo(savedUser.getId());
  }

  @Test
  void findByProviderAndProviderSubject_returnsEmptyWhenNotExists() {
    Optional<UserIdentity> found = userIdentityRepository.findByProviderAndProviderSubject("github",
        "nonexistent");

    assertThat(found).isEmpty();
  }

  // ------------------------------------------------------- listByUserId

  @Test
  void findAllByUserId_returnsAllIdentitiesForUser() {
    userIdentityRepository.save(
        UserIdentity.builder().user(savedUser).provider("google").providerSubject("g-001").build());
    userIdentityRepository.save(UserIdentity.builder().user(savedUser).provider("github")
        .providerSubject("gh-001").build());

    List<UserIdentity> identities = userIdentityRepository.findAllByUserId(savedUser.getId());

    assertThat(identities).hasSize(2);
    assertThat(identities).extracting(UserIdentity::getProvider).containsExactlyInAnyOrder("google",
        "github");
  }

  @Test
  void findAllByUserId_returnsEmptyListWhenNoIdentities() {
    List<UserIdentity> identities = userIdentityRepository.findAllByUserId(savedUser.getId());
    assertThat(identities).isEmpty();
  }

  // ------------------------------------------------- unique constraint

  @Test
  void insert_throwsOnDuplicateProviderSubject() {
    userIdentityRepository.saveAndFlush(UserIdentity.builder().user(savedUser).provider("google")
        .providerSubject("duplicate-subject").build());

    UserIdentity duplicate = UserIdentity.builder().user(savedUser).provider("google")
        .providerSubject("duplicate-subject").build();

    assertThatThrownBy(() -> {
      userIdentityRepository.saveAndFlush(duplicate);
    }).isInstanceOf(DataIntegrityViolationException.class);
  }

  @Test
  void insert_allowsSameSubjectForDifferentProviders() {
    userIdentityRepository.saveAndFlush(UserIdentity.builder().user(savedUser).provider("google")
        .providerSubject("same-subject").build());

    assertThatNoException().isThrownBy(() -> userIdentityRepository.saveAndFlush(UserIdentity
        .builder().user(savedUser).provider("github").providerSubject("same-subject").build()));
  }
}
