package com.univoyage.auth.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "app.auth.email-verification")
@Getter
@Setter
public class EmailVerificationSecurityProperties {

  private Duration ttl = Duration.ofHours(24);

  private int maxAttemptsPerToken = 5;

  private int requestEmailMaxAttempts = 3;
  private Duration requestEmailWindow = Duration.ofMinutes(15);

  private int requestIpMaxAttempts = 15;
  private Duration requestIpWindow = Duration.ofMinutes(15);

  private int confirmIpMaxAttempts = 20;
  private Duration confirmIpWindow = Duration.ofMinutes(15);

  private String frontendVerifyUrl = "http://localhost:5173/auth/verify-email";
}
