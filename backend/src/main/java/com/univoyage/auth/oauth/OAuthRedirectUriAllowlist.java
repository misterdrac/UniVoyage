package com.univoyage.auth.oauth;

import java.util.List;

/**
 * Validates redirect URIs used in OAuth token exchange against configured allowlist.
 */
public final class OAuthRedirectUriAllowlist {

  private OAuthRedirectUriAllowlist() {
  }

  /**
   * @throws IllegalArgumentException
   *           when uri is blank or not in allowlist
   */
  public static void validate(String uri, List<String> allowlist) {
    if (uri == null || uri.isBlank()) {
      throw new IllegalArgumentException("OAuth redirect_uri is missing");
    }
    if (allowlist == null || allowlist.isEmpty()) {
      throw new IllegalArgumentException("OAuth redirect URI allowlist is not configured");
    }
    if (!allowlist.contains(uri)) {
      throw new IllegalArgumentException("OAuth redirect_uri is not allowlisted");
    }
  }
}
