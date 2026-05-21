import type { OAuthProvider } from "@/types/auth";

export type OAuthCallbackParams = {
  code: string | null;
  state: string | null;
  error: string | null;
  errorDescription: string | null;
};

export type OAuthProviderConfig = {
  provider: OAuthProvider;
  label: string;
  beginPath: string;
  callbackPath: string;
  callbackEndpoint: string;
};

export type OAuthPostMessage =
  | { type: "OAUTH_SUCCESS"; provider: OAuthProvider }
  | { type: "OAUTH_ERROR"; provider: OAuthProvider; error: string };

/** @deprecated Legacy Google popup messages — still accepted by {@link beginOAuth}. */
export type LegacyGoogleOAuthPostMessage =
  | { type: "GOOGLE_OAUTH_SUCCESS" }
  | { type: "GOOGLE_OAUTH_ERROR"; error: string };
