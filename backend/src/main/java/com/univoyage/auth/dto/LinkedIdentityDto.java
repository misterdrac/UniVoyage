package com.univoyage.auth.dto;

import com.univoyage.auth.model.UserIdentity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Safe view of a linked sign-in provider for the authenticated user. Does not
 * expose internal subject IDs or row IDs.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LinkedIdentityDto {

  /** Provider key, e.g. {@code google}. */
  private String provider;

  /** User-facing label, e.g. {@code Google}. */
  private String label;

  /** When this provider was first linked. */
  private Instant linkedAt;

  public static LinkedIdentityDto from(UserIdentity identity) {
    return LinkedIdentityDto.builder().provider(identity.getProvider())
        .label(providerLabel(identity.getProvider())).linkedAt(identity.getCreatedAt()).build();
  }

  public static LinkedIdentityDto password(Instant linkedAt) {
    return LinkedIdentityDto.builder().provider("password").label("Email & password")
        .linkedAt(linkedAt).build();
  }

  private static String providerLabel(String provider) {
    if (provider == null) {
      return "Unknown";
    }
    return switch (provider.toLowerCase()) {
      case "google" -> "Google";
      case "github" -> "GitHub";
      case "linkedin" -> "LinkedIn";
      case "password" -> "Email & password";
      default -> provider.substring(0, 1).toUpperCase() + provider.substring(1);
    };
  }
}
