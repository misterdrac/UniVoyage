package com.univoyage.auth.otp;

/**
 * Delivers a one-time code to the user. Implementations must not log the
 * plaintext code.
 */
public interface OtpNotificationPort {

  void send(String normalizedEmail, EmailOtpPurpose purpose, String plainCode);
}
