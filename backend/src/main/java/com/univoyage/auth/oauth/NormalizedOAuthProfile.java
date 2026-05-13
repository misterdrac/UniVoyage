package com.univoyage.auth.oauth;

/**
 * Provider-agnostic claims after token validation, before local user resolution.
 */
public record NormalizedOAuthProfile(IdentityProvider provider, String subject, String email,
    boolean emailVerified, String givenName, String familyName, String picture) {

  public NormalizedOAuthProfile {
    subject = subject != null ? subject.trim() : "";
    email = email != null ? email.trim() : "";
    givenName = givenName != null ? givenName.trim() : "";
    familyName = familyName != null ? familyName.trim() : "";
    picture = picture != null ? picture.trim() : "";
  }
}
