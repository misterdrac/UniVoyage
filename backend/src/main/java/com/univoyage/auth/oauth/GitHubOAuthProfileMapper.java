package com.univoyage.auth.oauth;

import java.util.List;
import java.util.Map;

/** Maps GitHub API user + email responses to {@link NormalizedOAuthProfile}. */
public final class GitHubOAuthProfileMapper {

  private GitHubOAuthProfileMapper() {
  }

  public static NormalizedOAuthProfile fromGitHubUser(Map<?, ?> user, List<Map<?, ?>> emails) {
    String sub = stringVal(user.get("id"));
    String email = stringVal(user.get("email"));
    boolean emailVerified = email != null && !email.isBlank();

    if ((email == null || email.isBlank()) && emails != null) {
      for (Map<?, ?> entry : emails) {
        if (isTruthy(entry.get("primary")) && isTruthy(entry.get("verified"))) {
          email = stringVal(entry.get("email"));
          emailVerified = true;
          break;
        }
      }
      if ((email == null || email.isBlank()) && emails != null) {
        for (Map<?, ?> entry : emails) {
          if (isTruthy(entry.get("verified"))) {
            email = stringVal(entry.get("email"));
            emailVerified = true;
            break;
          }
        }
      }
    }

    String name = stringVal(user.get("name"));
    String given = "";
    String family = "";
    if (name != null && !name.isBlank()) {
      int space = name.indexOf(' ');
      if (space > 0) {
        given = name.substring(0, space).trim();
        family = name.substring(space + 1).trim();
      } else {
        given = name.trim();
      }
    }

    String picture = stringVal(user.get("avatar_url"));
    return new NormalizedOAuthProfile(IdentityProvider.GITHUB, sub, email != null ? email : "",
        emailVerified, given, family, picture != null ? picture : "");
  }

  private static boolean isTruthy(Object v) {
    return Boolean.TRUE.equals(v) || "true".equalsIgnoreCase(String.valueOf(v));
  }

  private static String stringVal(Object v) {
    return v != null ? v.toString().trim() : "";
  }
}
