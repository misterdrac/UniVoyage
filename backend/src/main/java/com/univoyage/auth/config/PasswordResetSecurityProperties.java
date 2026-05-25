package com.univoyage.auth.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "app.auth.password-reset")
@Getter
@Setter
public class PasswordResetSecurityProperties {

  /** Longer than sign-in OTP (default 10m). */
  private Duration ttl = Duration.ofHours(1);

  private int maxAttemptsPerToken = 5;

  private int forgotEmailMaxAttempts = 3;
  private Duration forgotEmailWindow = Duration.ofMinutes(15);

  private int forgotIpMaxAttempts = 15;
  private Duration forgotIpWindow = Duration.ofMinutes(15);

  private int resetIpMaxAttempts = 20;
  private Duration resetIpWindow = Duration.ofMinutes(15);

  /** Base URL without query; token is appended as ?token= */
  private String frontendResetUrl = "http://localhost:5173/auth/reset-password";

  private boolean revokeSessionsOnReset = true;
}
