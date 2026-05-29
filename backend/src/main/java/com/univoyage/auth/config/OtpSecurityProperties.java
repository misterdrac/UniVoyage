package com.univoyage.auth.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "app.auth.otp")
@Getter
@Setter
public class OtpSecurityProperties {

  private Duration ttl = Duration.ofMinutes(10);
  private Duration resendCooldown = Duration.ofSeconds(90);
  private int maxResendsPerChallenge = 2;
  private int maxVerifyAttemptsPerChallenge = 5;
  private Duration verifyLockDuration = Duration.ofMinutes(30);

  /** POST /api/auth/otp/request per email per window. */
  private int requestEmailMaxAttempts = 3;
  private Duration requestEmailWindow = Duration.ofMinutes(15);

  /** POST /api/auth/otp/request per IP per window. */
  private int requestIpMaxAttempts = 15;
  private Duration requestIpWindow = Duration.ofMinutes(15);

  /** POST /api/auth/otp/verify per email per window. */
  private int verifyEmailMaxAttempts = 5;
  private Duration verifyEmailWindow = Duration.ofMinutes(15);

  /** POST /api/auth/otp/verify per IP per window. */
  private int verifyIpMaxAttempts = 20;
  private Duration verifyIpWindow = Duration.ofMinutes(15);

  /**
   * When true, successful REGISTER OTP verification creates a user if the email
   * is new.
   */
  private boolean autoRegisterOnVerify = false;

  /** Default ISO country for auto-register (must exist in countries table). */
  private String autoRegisterCountryCode = "MT";
}
