import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  EmailOtpPurpose,
  LinkedIdentity,
  OAuthProvider,
  SignInMethod,
} from "@/types/auth";
import type { User } from "@/types/user";
import { apiService } from "@/services/api";
import { API_CONSTANTS } from "@/lib/constants";
import { safeAuthError } from "@/lib/auth/safeAuthLog";
import { beginOAuth as startOAuth } from "@/lib/oauth";
import { OAUTH_PROVIDER_CONFIG } from "@/lib/oauth/constants";
import { AuthSignInOverlay } from "@/components/auth/AuthSignInOverlay";
import { clearAllPlacesCache } from "@/lib/placesCache";
import { clearAllWeatherCache } from "@/lib/weatherCache";
import { clearAllTripData } from "@/lib/tripCacheUtils";
import { clearAllHotelCache } from "@/lib/hotelsCache";

interface SignupData {
  email: string;
  password: string;
  name?: string;
  surname?: string;
  hobbyIds?: number[];
  languageCodes?: string[];
  countryCode?: string;
  visitedCountryCodes?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  lastSignInMethod: SignInMethod | null;
  identities: LinkedIdentity[];
  identitiesLoading: boolean;
  identitiesError: string | null;
  adminTwoFactorVerified: boolean;
  setAdminTwoFactorVerified: (verified: boolean) => void;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  emailOtpSignIn: (
    email: string,
    code: string,
    purpose?: EmailOtpPurpose,
  ) => Promise<{
    success: boolean;
    error?: string;
    retryAfterSeconds?: number;
  }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: {
    name?: string;
    surname?: string;
    countryCode?: string;
    hobbyIds?: number[];
    languageCodes?: string[];
    visitedCountryCodes?: string[];
    profileImagePath?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loadUser: () => Promise<User | null>;
  loadIdentities: () => Promise<LinkedIdentity[]>;
  /** Reload user + linked sign-in methods (single entry for post-login / OAuth). */
  refreshSession: () => Promise<User | null>;
  beginOAuth: (provider: OAuthProvider) => void;
  isLoading: boolean;
  signInOverlayMethod: string | null;
  showSignInOverlay: (method: string) => void;
  hideSignInOverlay: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

const ADMIN_TWO_FACTOR_SESSION_PREFIX = "univoyage:admin-2fa:";

function isAdminUser(user: User | null | undefined): user is User {
  return user?.role === "ADMIN" || user?.role === "HEAD_ADMIN";
}

function adminTwoFactorStorageKey(user: User) {
  return `${ADMIN_TWO_FACTOR_SESSION_PREFIX}${user.id}:${user.role}`;
}

function readAdminTwoFactorVerified(user: User | null) {
  if (!isAdminUser(user)) return false;

  try {
    return (
      sessionStorage.getItem(adminTwoFactorStorageKey(user)) === "verified"
    );
  } catch {
    return false;
  }
}

function clearAdminTwoFactorSessions() {
  try {
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith(ADMIN_TWO_FACTOR_SESSION_PREFIX))
      .forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // Session storage can be unavailable in private/browser-restricted modes.
  }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [identities, setIdentities] = useState<LinkedIdentity[]>([]);
  const [identitiesLoading, setIdentitiesLoading] = useState(false);
  const [identitiesError, setIdentitiesError] = useState<string | null>(null);
  const [adminTwoFactorVerified, setAdminTwoFactorVerifiedState] =
    useState(false);
  const [signInOverlayMethod, setSignInOverlayMethod] = useState<string | null>(
    null,
  );

  const showSignInOverlay = useCallback((method: string) => {
    setSignInOverlayMethod(method);
  }, []);

  const hideSignInOverlay = useCallback(() => {
    setSignInOverlayMethod(null);
  }, []);

  const persistUser = useCallback((next: User | null) => {
    setUser(next);
    if (next) {
      localStorage.setItem(API_CONSTANTS.USER_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(API_CONSTANTS.USER_KEY);
    }
  }, []);

  useEffect(() => {
    setAdminTwoFactorVerifiedState(readAdminTwoFactorVerified(user));
  }, [user]);

  const setAdminTwoFactorVerified = useCallback(
    (verified: boolean) => {
      setAdminTwoFactorVerifiedState(verified);
      if (!isAdminUser(user)) return;

      try {
        const key = adminTwoFactorStorageKey(user);
        if (verified) {
          sessionStorage.setItem(key, "verified");
        } else {
          sessionStorage.removeItem(key);
        }
      } catch {
        // Keep the in-memory state even if session storage is unavailable.
      }
    },
    [user],
  );

  const loadIdentities = useCallback(async (): Promise<LinkedIdentity[]> => {
    if (!user) {
      setIdentities([]);
      return [];
    }
    setIdentitiesLoading(true);
    setIdentitiesError(null);
    try {
      const list = await apiService.getIdentities();
      setIdentities(list);
      return list;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not load sign-in methods";
      setIdentitiesError(message);
      setIdentities([]);
      return [];
    } finally {
      setIdentitiesLoading(false);
    }
  }, [user]);

  const loadUser = useCallback(async (): Promise<User | null> => {
    try {
      const me = await apiService.getCurrentUser();
      persistUser(me);
      return me;
    } catch (err) {
      safeAuthError("loadUser error:", err);
      persistUser(null);
      return null;
    }
  }, [persistUser]);

  const refreshSession = useCallback(async (): Promise<User | null> => {
    const me = await loadUser();
    if (me) {
      setIdentitiesLoading(true);
      setIdentitiesError(null);
      try {
        const list = await apiService.getIdentities();
        setIdentities(list);
      } catch (err) {
        setIdentitiesError(
          err instanceof Error ? err.message : "Could not load sign-in methods",
        );
        setIdentities([]);
      } finally {
        setIdentitiesLoading(false);
      }
    } else {
      setIdentities([]);
      setIdentitiesError(null);
    }
    return me;
  }, [loadUser]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const me = await apiService.getCurrentUser();
        if (me) {
          persistUser(me);
          const list = await apiService.getIdentities();
          setIdentities(list);
        }
      } catch (error) {
        safeAuthError("Error initializing auth:", error);
        localStorage.removeItem(API_CONSTANTS.USER_KEY);
        localStorage.removeItem(API_CONSTANTS.AUTH_TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [persistUser]);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      showSignInOverlay("Email & password");
      if (!email || !password) {
        return { success: false, error: "Email and password are required" };
      }
      const result = await apiService.login(email, password);
      if (result.success && result.user) {
        await refreshSession();
        return { success: true };
      }
      return { success: false, error: result.error || "Login failed" };
    } catch (error) {
      safeAuthError("Login error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred during login",
      };
    } finally {
      hideSignInOverlay();
    }
  };

  const signup = async (
    data: SignupData,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      showSignInOverlay("Email & password");
      if (!data.email || !data.password) {
        return { success: false, error: "Email and password are required" };
      }
      const result = await apiService.register(data);
      if (result.success && result.user) {
        await refreshSession();
        return { success: true };
      }
      return { success: false, error: result.error || "Signup failed" };
    } catch (error) {
      safeAuthError("Signup error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred during signup",
      };
    } finally {
      hideSignInOverlay();
    }
  };

  const emailOtpSignIn = useCallback(
    async (
      email: string,
      code: string,
      purpose: EmailOtpPurpose = "REGISTER",
    ): Promise<{
      success: boolean;
      error?: string;
      retryAfterSeconds?: number;
    }> => {
      try {
        showSignInOverlay("Email code");
        if (!email || !code || code.length !== 6) {
          return {
            success: false,
            error: "Enter the 6-digit code from your email.",
          };
        }
        const result = await apiService.verifyEmailOtp(email, code, purpose);
        if (result.success && result.user) {
          await refreshSession();
          return { success: true };
        }
        return {
          success: false,
          error: result.error || "We could not complete email-code sign-in.",
          retryAfterSeconds: result.retryAfterSeconds,
        };
      } catch (error) {
        safeAuthError("Email OTP sign-in error:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "An error occurred during email-code sign-in",
        };
      } finally {
        hideSignInOverlay();
      }
    },
    [refreshSession, showSignInOverlay, hideSignInOverlay],
  );

  const beginOAuth = useCallback(
    (provider: OAuthProvider) => {
      showSignInOverlay(OAUTH_PROVIDER_CONFIG[provider].label);
      startOAuth(provider);
    },
    [showSignInOverlay],
  );

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      safeAuthError("Logout error:", error);
    } finally {
      persistUser(null);
      setAdminTwoFactorVerifiedState(false);
      clearAdminTwoFactorSessions();
      setIdentities([]);
      setIdentitiesError(null);
      localStorage.removeItem(API_CONSTANTS.AUTH_TOKEN_KEY);
      clearAllTripData();
      clearAllPlacesCache();
      clearAllWeatherCache();
      clearAllHotelCache();
    }
  };

  const updateProfile = async (data: {
    name?: string;
    surname?: string;
    countryCode?: string;
    hobbyIds?: number[];
    languageCodes?: string[];
    visitedCountryCodes?: string[];
    profileImagePath?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const result = await apiService.updateProfile(data);
      if (result.success && result.user) {
        persistUser(result.user);
        return { success: true };
      }
      return { success: false, error: result.error || "Update failed" };
    } catch (error) {
      safeAuthError("Update profile error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred during update",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const lastSignInMethod =
    (user?.lastSignInMethod as SignInMethod | undefined) ?? null;

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      lastSignInMethod,
      identities,
      identitiesLoading,
      identitiesError,
      adminTwoFactorVerified,
      setAdminTwoFactorVerified,
      login,
      emailOtpSignIn,
      signup,
      logout,
      updateProfile,
      loadUser,
      loadIdentities,
      refreshSession,
      beginOAuth,
      isLoading,
      signInOverlayMethod,
      showSignInOverlay,
      hideSignInOverlay,
    }),
    [
      user,
      lastSignInMethod,
      identities,
      identitiesLoading,
      identitiesError,
      adminTwoFactorVerified,
      setAdminTwoFactorVerified,
      login,
      emailOtpSignIn,
      signup,
      logout,
      updateProfile,
      loadUser,
      loadIdentities,
      refreshSession,
      beginOAuth,
      isLoading,
      signInOverlayMethod,
      showSignInOverlay,
      hideSignInOverlay,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthSignInOverlay
        open={!!signInOverlayMethod}
        method={signInOverlayMethod}
      />
    </AuthContext.Provider>
  );
};
