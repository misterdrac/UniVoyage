package com.univoyage.contact.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "app.contact")
@Getter
@Setter
public class ContactLimitProperties {

  private int ipMaxAttempts = 5;

  private Duration ipWindow = Duration.ofMinutes(15);
}
