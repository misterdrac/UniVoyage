import { API_CONFIG } from "@/config/apiConfig";
import type { OAuthProvider } from "@/types/auth";
import { OAUTH_PROVIDER_CONFIG, OAUTH_RETURN_URL_KEY } from "./constants";

/**
 * Starts OAuth with a full-page redirect (no popup). The callback route completes
 * sign-in and returns the user to the stored return URL.
 */
export function beginOAuth(provider: OAuthProvider): void {
  const config = OAUTH_PROVIDER_CONFIG[provider];
  const returnUrl = window.location.pathname + window.location.search;
  sessionStorage.setItem(OAUTH_RETURN_URL_KEY, returnUrl);

  const beginUrl = `${API_CONFIG.BASE_URL}${config.beginPath}`;
  window.location.assign(beginUrl);
}
