package com.univoyage.auth.oauth;

import org.springframework.security.oauth2.jwt.Jwt;

/** Validates and parses Google OIDC ID tokens. */
public interface GoogleIdTokenVerifier {

  /**
   * @param expectedNonce
   *          nonce from the authorize request when using signed OAuth state;
   *          {@code null} to skip nonce validation (legacy clients that do not
   *          send {@code state})
   */
  Jwt verify(String idToken, String expectedNonce);
}
