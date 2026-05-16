package com.univoyage.auth.oauth;

import java.time.Instant;

/** Parsed OAuth authorization {@code state} after signature verification. */
public record OAuthStatePayload(String nonce, String redirectUri, Instant expiresAt) {
}
