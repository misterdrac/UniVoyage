package com.univoyage.auth.oauth;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.Arrays;
import java.util.List;

/**
 * Google OAuth client registration (manual authorization-code flow).
 */
@ConfigurationProperties(prefix = "app.auth.google")
@Getter
@Setter
public class GoogleOAuthProperties {

  private String clientId = "";

  private String clientSecret = "";

  /**
   * Comma-separated redirect URIs allowlisted for this client (must match Google Cloud console).
   */
  private String redirectUris = "";

  public List<String> redirectUriList() {
    if (redirectUris == null || redirectUris.isBlank()) {
      return List.of();
    }
    return Arrays.stream(redirectUris.split(",")).map(String::trim).filter(s -> !s.isEmpty())
        .toList();
  }
}
