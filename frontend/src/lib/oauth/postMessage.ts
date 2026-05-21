import type { OAuthProvider } from "@/types/auth";
import type { OAuthPostMessage } from "./types";

export function postOAuthSuccess(
  opener: Window | null,
  provider: OAuthProvider,
  targetOrigin: string,
): void {
  const message: OAuthPostMessage = { type: "OAUTH_SUCCESS", provider };
  opener?.postMessage(message, targetOrigin);
}

export function postOAuthError(
  opener: Window | null,
  provider: OAuthProvider,
  error: string,
  targetOrigin: string,
): void {
  const message: OAuthPostMessage = {
    type: "OAUTH_ERROR",
    provider,
    error,
  };
  opener?.postMessage(message, targetOrigin);
}

export function isOAuthPostMessage(data: unknown): data is OAuthPostMessage {
  if (!data || typeof data !== "object") return false;
  const msg = data as Record<string, unknown>;
  return (
    (msg.type === "OAUTH_SUCCESS" || msg.type === "OAUTH_ERROR") &&
    typeof msg.provider === "string"
  );
}
