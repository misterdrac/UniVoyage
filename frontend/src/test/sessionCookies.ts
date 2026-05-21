import { API_CONSTANTS } from "@/lib/constants";

/** Reads a cookie value visible to `document.cookie` (non-HttpOnly). */
export function readCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp(
      `(?:^|;\\s*)${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`,
    ),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/** Simulates auth cookies the backend sets after OAuth (observable in tests). */
export function setSessionCookies(accessJwt: string, csrf: string): void {
  document.cookie = `${API_CONSTANTS.AUTH_TOKEN_KEY}=${encodeURIComponent(accessJwt)}; path=/`;
  document.cookie = `${API_CONSTANTS.CSRF_COOKIE_NAME}=${encodeURIComponent(csrf)}; path=/`;
}

export function clearSessionCookies(): void {
  document.cookie = `${API_CONSTANTS.AUTH_TOKEN_KEY}=; path=/; max-age=0`;
  document.cookie = `${API_CONSTANTS.CSRF_COOKIE_NAME}=; path=/; max-age=0`;
}

export function hasAuthTokenInStorage(): boolean {
  return !!localStorage.getItem(API_CONSTANTS.AUTH_TOKEN_KEY);
}

export function hasSessionCookies(): boolean {
  return (
    readCookie(API_CONSTANTS.AUTH_TOKEN_KEY) != null &&
    readCookie(API_CONSTANTS.CSRF_COOKIE_NAME) != null
  );
}
