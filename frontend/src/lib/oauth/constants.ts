import { API_CONFIG } from "@/config/apiConfig";
import type { OAuthProvider } from "@/types/auth";
import type { OAuthProviderConfig } from "./types";

export const OAUTH_RETURN_URL_KEY = "oauth_return_url";

export const OAUTH_PROVIDER_CONFIG: Record<OAuthProvider, OAuthProviderConfig> =
  {
    google: {
      provider: "google",
      label: "Google",
      beginPath: API_CONFIG.ENDPOINTS.AUTH.GOOGLE,
      callbackPath: "/auth/google/callback",
      callbackEndpoint: API_CONFIG.ENDPOINTS.AUTH.GOOGLE_CALLBACK,
    },
    github: {
      provider: "github",
      label: "GitHub",
      beginPath: API_CONFIG.ENDPOINTS.AUTH.GITHUB,
      callbackPath: "/auth/github/callback",
      callbackEndpoint: API_CONFIG.ENDPOINTS.AUTH.GITHUB_CALLBACK,
    },
    linkedin: {
      provider: "linkedin",
      label: "LinkedIn",
      beginPath: API_CONFIG.ENDPOINTS.AUTH.LINKEDIN,
      callbackPath: "/auth/linkedin/callback",
      callbackEndpoint: API_CONFIG.ENDPOINTS.AUTH.LINKEDIN_CALLBACK,
    },
  };

export function isOAuthProvider(value: string): value is OAuthProvider {
  return value in OAUTH_PROVIDER_CONFIG;
}
