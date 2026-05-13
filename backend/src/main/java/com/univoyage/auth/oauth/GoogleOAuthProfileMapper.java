package com.univoyage.auth.oauth;

import org.springframework.security.oauth2.jwt.Jwt;

/** Maps Google ID token claims to {@link NormalizedOAuthProfile}. */
public final class GoogleOAuthProfileMapper {

  private GoogleOAuthProfileMapper() {
  }

  public static NormalizedOAuthProfile fromGoogleIdToken(Jwt jwt) {
    String sub = jwt.getSubject() != null ? jwt.getSubject() : "";
    String email = jwt.getClaimAsString("email");
    if (email == null) {
      email = "";
    }
    Boolean verifiedClaim = jwt.getClaimAsBoolean("email_verified");
    boolean emailVerified = verifiedClaim != null && verifiedClaim;
    String given = jwt.getClaimAsString("given_name");
    String family = jwt.getClaimAsString("family_name");
    String picture = jwt.getClaimAsString("picture");
    return new NormalizedOAuthProfile(IdentityProvider.GOOGLE, sub, email, emailVerified,
        given != null ? given : "", family != null ? family : "",
        picture != null ? picture : "");
  }
}
