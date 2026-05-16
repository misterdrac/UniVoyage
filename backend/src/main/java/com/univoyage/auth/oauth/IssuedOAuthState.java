package com.univoyage.auth.oauth;

/** Signed OAuth state plus plaintext nonce for the OIDC authorize request. */
public record IssuedOAuthState(String stateQueryParam, String nonceForAuthorizeUrl) {
}
