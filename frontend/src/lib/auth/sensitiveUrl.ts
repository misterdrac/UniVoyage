/** Query keys that must not remain in the address bar after auth flows consume them. */
export const SENSITIVE_QUERY_PARAM_KEYS = [
  "token",
  "code",
  "state",
  "error",
  "error_description",
  "access_token",
  "refresh_token",
] as const;

export type SensitiveQueryParamKey =
  (typeof SENSITIVE_QUERY_PARAM_KEYS)[number];

function parseSearch(search: string): URLSearchParams {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  return new URLSearchParams(raw);
}

export function locationHasSensitiveQueryParams(search: string): boolean {
  const params = parseSearch(search);
  return SENSITIVE_QUERY_PARAM_KEYS.some((key) => params.has(key));
}

/** Removes sensitive keys; returns `?foo=bar` or empty string. */
export function stripSensitiveSearchParams(search: string): string {
  const params = parseSearch(search);
  for (const key of SENSITIVE_QUERY_PARAM_KEYS) {
    params.delete(key);
  }
  const next = params.toString();
  return next ? `?${next}` : "";
}

export function readQueryParam(search: string, param: string): string {
  return parseSearch(search).get(param)?.trim() || "";
}
