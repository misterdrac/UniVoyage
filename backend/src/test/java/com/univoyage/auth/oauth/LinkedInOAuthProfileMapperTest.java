package com.univoyage.auth.oauth;

import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class LinkedInOAuthProfileMapperTest {

  @Test
  void mapsUserinfoClaims() {
    Map<?, ?> claims = Map.of("sub", "linkedin-sub-1", "email", "user@linkedin.com",
        "email_verified", true, "given_name", "Lin", "family_name", "Kedin", "picture",
        "https://media.licdn.com/photo.jpg");

    NormalizedOAuthProfile p = LinkedInOAuthProfileMapper.fromUserInfo(claims);

    assertThat(p.provider()).isEqualTo(IdentityProvider.LINKEDIN);
    assertThat(p.subject()).isEqualTo("linkedin-sub-1");
    assertThat(p.email()).isEqualTo("user@linkedin.com");
    assertThat(p.emailVerified()).isTrue();
    assertThat(p.givenName()).isEqualTo("Lin");
    assertThat(p.familyName()).isEqualTo("Kedin");
  }

  @Test
  void parsesEmailVerifiedAsString() {
    Map<?, ?> claims = Map.of("sub", "s", "email", "a@b.com", "email_verified", "true");
    assertThat(LinkedInOAuthProfileMapper.fromUserInfo(claims).emailVerified()).isTrue();
  }

  @Test
  void splitsNameWhenGivenNameMissing() {
    Map<?, ?> claims = Map.of("sub", "s", "email", "a@b.com", "email_verified", true, "name",
        "Full Name");
    NormalizedOAuthProfile p = LinkedInOAuthProfileMapper.fromUserInfo(claims);
    assertThat(p.givenName()).isEqualTo("Full");
    assertThat(p.familyName()).isEqualTo("Name");
  }

  @Test
  void missingEmailLeavesProfileEmpty() {
    Map<?, ?> claims = Map.of("sub", "s-only");
    NormalizedOAuthProfile p = LinkedInOAuthProfileMapper.fromUserInfo(claims);
    assertThat(p.email()).isEmpty();
    assertThat(p.emailVerified()).isFalse();
  }
}
