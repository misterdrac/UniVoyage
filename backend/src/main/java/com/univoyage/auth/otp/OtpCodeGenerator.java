package com.univoyage.auth.otp;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

/** Generates numeric OTP codes (never logged by callers). */
@Component
public class OtpCodeGenerator {

  private static final int CODE_LENGTH = 6;
  private final SecureRandom random = new SecureRandom();

  public String generate() {
    int bound = (int) Math.pow(10, CODE_LENGTH);
    int value = random.nextInt(bound);
    return String.format("%0" + CODE_LENGTH + "d", value);
  }
}
