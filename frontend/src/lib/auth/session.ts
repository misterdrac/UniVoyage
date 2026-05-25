import { ROUTE_PATHS } from "@/config/routes";
import { OAUTH_RETURN_URL_KEY } from "@/lib/oauth";

/**
 * Returns stored post-OAuth path and clears the session key.
 */
export function consumeOAuthReturnUrl(): string {
  const url = sessionStorage.getItem(OAUTH_RETURN_URL_KEY);
  sessionStorage.removeItem(OAUTH_RETURN_URL_KEY);
  return url || ROUTE_PATHS.HOME;
}
