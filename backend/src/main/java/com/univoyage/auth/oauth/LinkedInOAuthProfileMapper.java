package com.univoyage.auth.oauth;

import java.util.Map;

/** Maps LinkedIn OIDC userinfo to {@link NormalizedOAuthProfile}. */
public final class LinkedInOAuthProfileMapper {

  private LinkedInOAuthProfileMapper() {
  }

  public static NormalizedOAuthProfile fromUserInfo(Map<?, ?> claims) {
    String sub = stringVal(claims.get("sub"));
    String email = stringVal(claims.get("email"));
    boolean emailVerified = parseEmailVerified(claims.get("email_verified"));
    String given = stringVal(claims.get("given_name"));
    String family = stringVal(claims.get("family_name"));
    if (given.isBlank()) {
      String name = stringVal(claims.get("name"));
      if (!name.isBlank()) {
        int space = name.indexOf(' ');
        if (space > 0) {
          given = name.substring(0, space).trim();
          family = name.substring(space + 1).trim();
        } else {
          given = name;
        }
      }
    }
    String picture = stringVal(claims.get("picture"));
    return new NormalizedOAuthProfile(IdentityProvider.LINKEDIN, sub, email, emailVerified, given,
        family, picture);
  }

  private static boolean parseEmailVerified(Object claim) {
    if (claim instanceof Boolean b) {
      return b;
    }
    if (claim instanceof String s) {
      return "true".equalsIgnoreCase(s);
    }
    return false;
  }

  private static String stringVal(Object v) {
    return v != null ? v.toString().trim() : "";
  }
}
