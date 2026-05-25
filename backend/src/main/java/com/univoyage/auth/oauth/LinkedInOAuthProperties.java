package com.univoyage.auth.oauth;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.Arrays;
import java.util.List;

@ConfigurationProperties(prefix = "app.auth.linkedin")
@Getter
@Setter
public class LinkedInOAuthProperties {

  private String clientId = "";
  private String clientSecret = "";
  private String redirectUris = "";

  public List<String> redirectUriList() {
    if (redirectUris == null || redirectUris.isBlank()) {
      return List.of();
    }
    return Arrays.stream(redirectUris.split(",")).map(String::trim).filter(s -> !s.isEmpty())
        .toList();
  }
}
