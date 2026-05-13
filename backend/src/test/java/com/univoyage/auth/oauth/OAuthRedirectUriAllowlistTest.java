package com.univoyage.auth.oauth;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class OAuthRedirectUriAllowlistTest {

  @Test
  @DisplayName("validate accepts URI present in allowlist")
  void acceptsListedUri() {
    OAuthRedirectUriAllowlist.validate("http://localhost/cb",
        List.of("http://other/cb", "http://localhost/cb"));
  }

  @Test
  @DisplayName("validate rejects blank URI")
  void rejectsBlank() {
    assertThatThrownBy(() -> OAuthRedirectUriAllowlist.validate("  ", List.of("http://localhost/cb")))
        .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("missing");
  }

  @Test
  @DisplayName("validate rejects URI not in allowlist")
  void rejectsUnknown() {
    assertThatThrownBy(
        () -> OAuthRedirectUriAllowlist.validate("http://evil/cb", List.of("http://localhost/cb")))
            .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("not allowlisted");
  }

  @Test
  @DisplayName("validate rejects empty allowlist")
  void rejectsEmptyAllowlist() {
    assertThatThrownBy(() -> OAuthRedirectUriAllowlist.validate("http://localhost/cb", List.of()))
        .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("not configured");
  }
}
