package com.univoyage.auth.security;

import io.jsonwebtoken.io.Encoders;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;

/** Generates opaque URL-safe tokens and stores SHA-256 hashes only. */
public final class SecretTokenHasher {

  private static final SecureRandom SECURE_RANDOM = new SecureRandom();

  private SecretTokenHasher() {
  }

  public static String newRawToken() {
    byte[] bytes = new byte[32];
    SECURE_RANDOM.nextBytes(bytes);
    return Encoders.BASE64URL.encode(bytes);
  }

  public static String sha256Hex(String raw) {
    if (raw == null || raw.isBlank()) {
      return "";
    }
    try {
      MessageDigest md = MessageDigest.getInstance("SHA-256");
      byte[] digest = md.digest(raw.getBytes(StandardCharsets.UTF_8));
      return HexFormat.of().formatHex(digest);
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException("SHA-256 not available", e);
    }
  }
}
