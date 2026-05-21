import { OAUTH_PROVIDER_CONFIG } from "./constants";
import type { OAuthProvider } from "@/types/auth";

const INVALID_STATE = "invalid or expired oauth state";

/**
 * Maps provider / backend error codes to user-safe copy (no internal IDs).
 */
export function mapOAuthError(
  provider: OAuthProvider,
  options?: {
    providerError?: string | null;
    providerErrorDescription?: string | null;
    backendError?: string | null;
  },
): string {
  const label = OAUTH_PROVIDER_CONFIG[provider].label;
  const providerError = options?.providerError?.toLowerCase() ?? "";
  const backend = options?.backendError?.trim() ?? "";
  const lowerBackend = backend.toLowerCase();

  if (providerError === "access_denied") {
    return `${label} sign-in was cancelled. You can try again when you're ready.`;
  }

  if (
    providerError === "invalid_request" ||
    providerError === "unauthorized_client"
  ) {
    return `We couldn't complete ${label} sign-in. Please try again.`;
  }

  if (lowerBackend.includes(INVALID_STATE)) {
    return "Your sign-in session expired or was interrupted. Please start sign-in again.";
  }

  if (
    lowerBackend.includes("email is not verified") ||
    lowerBackend.includes("email not verified")
  ) {
    return `Your ${label} email must be verified before you can sign in.`;
  }

  if (lowerBackend.includes("no email")) {
    return `We couldn't get an email from your ${label} account. Try another sign-in method.`;
  }

  if (lowerBackend.includes("missing authorization code")) {
    return "Sign-in didn't finish correctly. Please try again.";
  }

  if (lowerBackend.includes("missing oauth state")) {
    return "Your sign-in session expired. Please try again.";
  }

  if (lowerBackend.includes("too many oauth")) {
    return "Too many sign-in attempts. Please wait a moment and try again.";
  }

  if (backend) {
    const generic =
      lowerBackend.includes("login failed") ||
      lowerBackend.includes("auth failed");
    if (generic) {
      return `${label} sign-in didn't work. Please try again.`;
    }
    return backend.length > 120
      ? `${label} sign-in didn't work. Please try again.`
      : backend;
  }

  if (options?.providerErrorDescription) {
    return `${label} sign-in didn't work. Please try again.`;
  }

  if (providerError) {
    return `${label} sign-in didn't work. Please try again.`;
  }

  return `${label} sign-in didn't work. Please try again.`;
}
