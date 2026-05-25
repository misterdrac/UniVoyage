package com.univoyage.auth.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "app.auth.admin-2fa")
@Getter
@Setter
public class AdminTwoFactorProperties {

  private boolean enabled = true;

  private int challengeIpMaxAttempts = 5;
  private Duration challengeIpWindow = Duration.ofMinutes(15);

  private int challengeEmailMaxAttempts = 3;
  private Duration challengeEmailWindow = Duration.ofMinutes(15);

  private int verifyIpMaxAttempts = 10;
  private Duration verifyIpWindow = Duration.ofMinutes(15);

  private int verifyEmailMaxAttempts = 5;
  private Duration verifyEmailWindow = Duration.ofMinutes(15);
}
