package com.univoyage.auth.password;

/**
 * Delivers password-reset and email-verification messages (no secrets in logs).
 */
public interface UserEmailNotificationPort {

  void sendPasswordReset(String normalizedEmail, String rawToken);

  void sendEmailVerification(String normalizedEmail, String rawToken);
}
