package com.univoyage.auth.password;

import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/** Captures last issued link token per email+purpose for integration tests. */
@Component
@Profile("test")
@Primary
public class TestUserEmailNotificationPort implements UserEmailNotificationPort {

  private final Map<String, String> lastTokenByKey = new ConcurrentHashMap<>();

  @Override
  public void sendPasswordReset(String normalizedEmail, String rawToken) {
    lastTokenByKey.put(key(normalizedEmail, UserEmailTokenPurpose.PASSWORD_RESET), rawToken);
  }

  @Override
  public void sendEmailVerification(String normalizedEmail, String rawToken) {
    lastTokenByKey.put(key(normalizedEmail, UserEmailTokenPurpose.EMAIL_VERIFICATION), rawToken);
  }

  public String lastToken(String normalizedEmail, UserEmailTokenPurpose purpose) {
    return lastTokenByKey.get(key(normalizedEmail, purpose));
  }

  public void clear() {
    lastTokenByKey.clear();
  }

  private static String key(String email, UserEmailTokenPurpose purpose) {
    return email.toLowerCase() + ":" + purpose.name();
  }
}
