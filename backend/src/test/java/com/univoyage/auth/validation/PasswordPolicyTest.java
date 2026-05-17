package com.univoyage.auth.validation;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PasswordPolicyTest {

  @Test
  void acceptsStrongPassword() {
    assertThat(PasswordPolicy.isValid("Str0ngPass")).isTrue();
  }

  @Test
  void rejectsShortOrMissingClasses() {
    assertThat(PasswordPolicy.isValid("short1A")).isFalse();
    assertThat(PasswordPolicy.isValid("alllowercase1")).isFalse();
    assertThat(PasswordPolicy.isValid("ALLUPPERCASE1")).isFalse();
    assertThat(PasswordPolicy.isValid("NoDigitsHere")).isFalse();
  }
}
