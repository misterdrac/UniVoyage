package com.univoyage.auth.oauth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;

/**
 * Signs and verifies OAuth 2.0 {@code state} for CSRF protection on the
 * authorization redirect.
 */
@Service
@Slf4j
public class OAuthStateService {

  private static final ObjectMapper MAPPER = new ObjectMapper();
  private static final int MIN_SECRET_LENGTH_BYTES = 32;

  private final OAuthSecurityProperties oauthSecurityProperties;
  private final Clock clock;
  private final byte[] cachedSecretBytes;

  public OAuthStateService(OAuthSecurityProperties oauthSecurityProperties, Clock clock) {
    this.oauthSecurityProperties = oauthSecurityProperties;
    this.clock = clock;
    this.cachedSecretBytes = validateAndCacheSecret();
  }

  /**
   * Creates signed {@code state} and returns the nonce that must be passed
   * separately as the OIDC {@code nonce} query parameter (and validated against
   * the ID token).
   */
  public IssuedOAuthState issueState(String redirectUri) {
    try {
      long expEpoch = Instant.now(clock).plus(oauthSecurityProperties.getStateTtl())
          .getEpochSecond();
      byte[] nonceBytes = new byte[16];
      new SecureRandom().nextBytes(nonceBytes);
      String nonce = HexFormat.of().formatHex(nonceBytes);

      StatePayload payload = new StatePayload(expEpoch, nonce, redirectUri);
      String json = MAPPER.writeValueAsString(payload);
      String payloadB64 = Base64.getUrlEncoder().withoutPadding()
          .encodeToString(json.getBytes(StandardCharsets.UTF_8));
      byte[] sig = sign(payloadB64.getBytes(StandardCharsets.UTF_8));
      String sigB64 = Base64.getUrlEncoder().withoutPadding().encodeToString(sig);
      return new IssuedOAuthState(payloadB64 + "." + sigB64, nonce);
    } catch (Exception e) {
      throw new IllegalStateException("Failed to create OAuth state", e);
    }
  }

  /**
   * @return parsed payload when signature and expiry are valid
   */
  public Optional<OAuthStatePayload> verifyAndParse(String state) {
    if (state == null || state.isBlank()) {
      return Optional.empty();
    }
    int dot = state.indexOf('.');
    if (dot < 0 || dot == state.length() - 1) {
      return Optional.empty();
    }
    String payloadB64 = state.substring(0, dot);
    String sigB64 = state.substring(dot + 1);
    try {
      byte[] expectedSig = Base64.getUrlDecoder().decode(sigB64);
      byte[] actualSig = sign(payloadB64.getBytes(StandardCharsets.UTF_8));
      if (!constantTimeEquals(expectedSig, actualSig)) {
        return Optional.empty();
      }
      String json = new String(Base64.getUrlDecoder().decode(payloadB64), StandardCharsets.UTF_8);
      JsonNode node = MAPPER.readTree(json);
      long exp = node.path("exp").asLong(0);
      String nonce = node.path("nonce").asText("");
      String redirectUri = node.path("redirect_uri").asText("");
      if (exp <= 0 || nonce.isBlank() || redirectUri.isBlank()) {
        return Optional.empty();
      }
      Instant expiresAt = Instant.ofEpochSecond(exp);
      if (!expiresAt.isAfter(Instant.now(clock))) {
        log.debug("OAuth state expired");
        return Optional.empty();
      }
      return Optional.of(new OAuthStatePayload(nonce, redirectUri, expiresAt));
    } catch (Exception e) {
      log.debug("OAuth state parse failed: {}", e.getMessage());
      return Optional.empty();
    }
  }

  private byte[] sign(byte[] data) throws Exception {
    Mac mac = Mac.getInstance("HmacSHA256");
    mac.init(new SecretKeySpec(cachedSecretBytes, "HmacSHA256"));
    return mac.doFinal(data);
  }

  private byte[] validateAndCacheSecret() {
    String secret = oauthSecurityProperties.getStateSecret();
    if (secret == null || secret.isBlank()) {
      throw new IllegalStateException("OAuth state secret is not configured");
    }
    byte[] secretBytes = secret.getBytes(StandardCharsets.UTF_8);
    if (secretBytes.length < MIN_SECRET_LENGTH_BYTES) {
      throw new IllegalStateException(
          "OAuth state secret must be at least " + MIN_SECRET_LENGTH_BYTES + " bytes (got "
              + secretBytes.length + " bytes). Use a stronger secret.");
    }
    return secretBytes;
  }

  private static boolean constantTimeEquals(byte[] a, byte[] b) {
    if (a.length != b.length) {
      return false;
    }
    int r = 0;
    for (int i = 0; i < a.length; i++) {
      r |= a[i] ^ b[i];
    }
    return r == 0;
  }

  private record StatePayload(long exp, String nonce, String redirect_uri) {
  }
}
