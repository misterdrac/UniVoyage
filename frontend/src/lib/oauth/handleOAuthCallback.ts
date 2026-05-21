import { apiService } from "@/services/api";
import type { OAuthProvider } from "@/types/auth";
import type { AuthResponse } from "@/config/apiConfig";
import type { User } from "@/types/user";
import { mapOAuthError } from "./mapOAuthError";
import { parseOAuthCallbackParams } from "./parseCallbackParams";

export type OAuthCallbackHandleResult =
  | { success: true; user?: User }
  | { success: false; error: string };

/**
 * Completes OAuth after redirect: validates query params and exchanges code with backend.
 */
export async function handleOAuthCallback(
  provider: OAuthProvider,
  search: string,
): Promise<OAuthCallbackHandleResult> {
  const params = parseOAuthCallbackParams(search);

  if (params.error) {
    return {
      success: false,
      error: mapOAuthError(provider, {
        providerError: params.error,
        providerErrorDescription: params.errorDescription,
      }),
    };
  }

  if (!params.code) {
    return {
      success: false,
      error: mapOAuthError(provider, {
        backendError: "Missing authorization code",
      }),
    };
  }

  const res: AuthResponse<User> = await apiService.oauthCallback(
    provider,
    params.code,
    params.state ?? undefined,
  );

  if (!res.success) {
    return {
      success: false,
      error: mapOAuthError(provider, { backendError: res.error }),
    };
  }

  return { success: true, user: res.user };
}
