import { useAuth } from "@/contexts/AuthContext";
import type { AuthSession } from "@/types/auth";

/**
 * Read-only view of the current auth session (user, identities, loading flags).
 */
export function useAuthSession(): AuthSession {
  const {
    user,
    isAuthenticated,
    isLoading,
    lastSignInMethod,
    identities,
    identitiesLoading,
    identitiesError,
  } = useAuth();

  return {
    user,
    isAuthenticated,
    isLoading,
    lastSignInMethod: lastSignInMethod ?? null,
    identities,
    identitiesLoading,
    identitiesError: identitiesError ?? null,
  };
}
