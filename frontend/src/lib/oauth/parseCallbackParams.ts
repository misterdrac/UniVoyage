import type { OAuthCallbackParams } from "./types";

/**
 * Parses OAuth redirect query parameters from a search string or full URL.
 */
export function parseOAuthCallbackParams(
  searchOrUrl: string,
): OAuthCallbackParams {
  const search = searchOrUrl.includes("?")
    ? new URL(searchOrUrl, "http://local").search
    : searchOrUrl.startsWith("?")
      ? searchOrUrl
      : `?${searchOrUrl}`;

  const params = new URLSearchParams(search);
  return {
    code: params.get("code"),
    state: params.get("state"),
    error: params.get("error"),
    errorDescription: params.get("error_description"),
  };
}
