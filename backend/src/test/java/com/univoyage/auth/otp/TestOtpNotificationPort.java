package com.univoyage.auth.otp;

import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/** Captures last issued OTP per email+purpose for integration tests. */
@Component
@Profile("test")
@Primary
public class TestOtpNotificationPort implements OtpNotificationPort {

  private final Map<String, String> lastCodeByKey = new ConcurrentHashMap<>();

  @Override
  public void send(String normalizedEmail, EmailOtpPurpose purpose, String plainCode) {
    lastCodeByKey.put(key(normalizedEmail, purpose), plainCode);
  }

  public String lastCode(String normalizedEmail, EmailOtpPurpose purpose) {
    return lastCodeByKey.get(key(normalizedEmail, purpose));
  }

  public void clear() {
    lastCodeByKey.clear();
  }

  private static String key(String email, EmailOtpPurpose purpose) {
    return email.toLowerCase() + ":" + purpose.name();
  }
}
