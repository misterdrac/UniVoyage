/** Supported OAuth provider keys (must match backend). */
export type OAuthProvider = "google" | "github" | "linkedin";

/** How the user last signed in (from GET /auth/me). */
export type SignInMethod =
  | OAuthProvider
  | "password"
  | "email_otp"
  | (string & {});

/** Linked sign-in method returned by GET /auth/identities. */
export interface LinkedIdentity {
  provider: SignInMethod;
  label: string;
  linkedAt?: string;
}

/** Session shape used by auth context and route guards. */
export interface AuthSession {
  user: import("@/types/user").User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastSignInMethod?: SignInMethod | null;
  identities: LinkedIdentity[];
  identitiesLoading: boolean;
  identitiesError?: string | null;
}
