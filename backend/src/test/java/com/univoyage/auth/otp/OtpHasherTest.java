package com.univoyage.auth.otp;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;

class OtpHasherTest {

  private final OtpHasher hasher = new OtpHasher(new BCryptPasswordEncoder());

  @Test
  @DisplayName("hash stores BCrypt digest and matches only the original code")
  void hashAndMatch() {
    String hash = hasher.hash("123456");
    assertThat(hash).startsWith("$2");
    assertThat(hasher.matches("123456", hash)).isTrue();
    assertThat(hasher.matches("654321", hash)).isFalse();
  }
}
