import { API_CONFIG } from "@/config/apiConfig";
import type { OAuthProvider } from "@/types/auth";
import { OAUTH_PROVIDER_CONFIG, OAUTH_RETURN_URL_KEY } from "./constants";
import { isOAuthPostMessage } from "./postMessage";
import type { LegacyGoogleOAuthPostMessage } from "./types";

const ALLOWED_MESSAGE_ORIGINS = [
  typeof window !== "undefined" ? window.location.origin : "",
  "https://univoyage-production-d7c5.up.railway.app",
].filter(Boolean);

function isAllowedOrigin(origin: string): boolean {
  return ALLOWED_MESSAGE_ORIGINS.includes(origin);
}

function isLegacyGoogleSuccess(data: unknown): boolean {
  return (
    !!data &&
    typeof data === "object" &&
    (data as LegacyGoogleOAuthPostMessage).type === "GOOGLE_OAUTH_SUCCESS"
  );
}

function isLegacyGoogleError(
  data: unknown,
): data is LegacyGoogleOAuthPostMessage & { error: string } {
  return (
    !!data &&
    typeof data === "object" &&
    (data as LegacyGoogleOAuthPostMessage).type === "GOOGLE_OAUTH_ERROR"
  );
}

/**
 * Starts OAuth in a popup (or full redirect when popups are blocked on mobile).
 * Resolves when the callback page posts success to the opener.
 */
export async function beginOAuth(provider: OAuthProvider): Promise<void> {
  const config = OAUTH_PROVIDER_CONFIG[provider];
  const returnUrl = window.location.pathname + window.location.search;
  sessionStorage.setItem(OAUTH_RETURN_URL_KEY, returnUrl);

  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const beginUrl = `${API_CONFIG.BASE_URL}${config.beginPath}`;
  const popup = window.open(
    beginUrl,
    `${provider}-oauth`,
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`,
  );

  if (!popup) {
    window.location.href = beginUrl;
    return;
  }

  return new Promise((resolve, reject) => {
    const messageListener = (event: MessageEvent) => {
      if (!isAllowedOrigin(event.origin)) return;

      if (isOAuthPostMessage(event.data)) {
        if (event.data.provider !== provider) return;
        window.removeEventListener("message", messageListener);
        clearInterval(checkClosed);
        popup.close();
        if (event.data.type === "OAUTH_SUCCESS") {
          resolve();
        } else {
          reject(
            new Error(event.data.error || `${config.label} sign-in failed`),
          );
        }
        return;
      }

      if (provider === "google" && isLegacyGoogleSuccess(event.data)) {
        window.removeEventListener("message", messageListener);
        clearInterval(checkClosed);
        popup.close();
        resolve();
        return;
      }

      if (provider === "google" && isLegacyGoogleError(event.data)) {
        window.removeEventListener("message", messageListener);
        clearInterval(checkClosed);
        popup.close();
        reject(new Error(event.data.error || "Google sign-in failed"));
      }
    };

    window.addEventListener("message", messageListener);

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener("message", messageListener);
        reject(new Error("Sign-in window was closed before completing."));
      }
    }, 500);
  });
}
