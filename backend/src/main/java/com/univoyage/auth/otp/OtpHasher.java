package com.univoyage.auth.otp;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Hash-only storage for OTP codes (BCrypt via Spring {@link PasswordEncoder}).
 */
@Component
public class OtpHasher {

  private final PasswordEncoder passwordEncoder;

  public OtpHasher(PasswordEncoder passwordEncoder) {
    this.passwordEncoder = passwordEncoder;
  }

  public String hash(String plainCode) {
    return passwordEncoder.encode(plainCode);
  }

  public boolean matches(String plainCode, String otpHash) {
    return passwordEncoder.matches(plainCode, otpHash);
  }
}
