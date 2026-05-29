package com.univoyage.auth.oauth;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class GitHubOAuthProfileMapperTest {

  @Test
  void mapsUserWithPrimaryVerifiedEmail() {
    Map<?, ?> user = Map.of("id", 42, "login", "octocat", "name", "Octo Cat", "avatar_url",
        "https://avatars.githubusercontent.com/u/42");
    List<Map<?, ?>> emails = List
        .of(Map.of("email", "octo@example.com", "primary", true, "verified", true));

    NormalizedOAuthProfile p = GitHubOAuthProfileMapper.fromGitHubUser(user, emails);

    assertThat(p.provider()).isEqualTo(IdentityProvider.GITHUB);
    assertThat(p.subject()).isEqualTo("42");
    assertThat(p.email()).isEqualTo("octo@example.com");
    assertThat(p.emailVerified()).isTrue();
    assertThat(p.givenName()).isEqualTo("Octo");
    assertThat(p.familyName()).isEqualTo("Cat");
  }

  @Test
  void usesEmailsApiWhenUserEmailIsPrivate() {
    Map<?, ?> user = Map.of("id", 99, "login", "private-user");
    List<Map<?, ?>> emails = List
        .of(Map.of("email", "private@users.noreply.github.com", "primary", true, "verified", true));

    NormalizedOAuthProfile p = GitHubOAuthProfileMapper.fromGitHubUser(user, emails);

    assertThat(p.email()).isEqualTo("private@users.noreply.github.com");
    assertThat(p.emailVerified()).isTrue();
  }

  @Test
  void noUsableEmailWhenListsAreEmpty() {
    Map<?, ?> user = Map.of("id", 1, "login", "ghost");
    NormalizedOAuthProfile p = GitHubOAuthProfileMapper.fromGitHubUser(user, List.of());
    assertThat(p.email()).isEmpty();
    assertThat(p.emailVerified()).isFalse();
  }

  @Test
  void unverifiedEmailsOnlyAreNotVerified() {
    Map<?, ?> user = Map.of("id", 2, "login", "u2");
    List<Map<?, ?>> emails = List
        .of(Map.of("email", "maybe@example.com", "primary", true, "verified", false));
    NormalizedOAuthProfile p = GitHubOAuthProfileMapper.fromGitHubUser(user, emails);
    assertThat(p.email()).isEmpty();
    assertThat(p.emailVerified()).isFalse();
  }
}
