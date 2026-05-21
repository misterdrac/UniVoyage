import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { LinkedIdentity, OAuthProvider, SignInMethod } from "@/types/auth";
import type { User } from "@/types/user";
import { apiService } from "@/services/api";
import { API_CONSTANTS } from "@/lib/constants";
import { beginOAuth as startOAuth } from "@/lib/oauth";
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
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
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
  beginOAuth: (provider: OAuthProvider) => Promise<void>;
  isLoading: boolean;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [identities, setIdentities] = useState<LinkedIdentity[]>([]);
  const [identitiesLoading, setIdentitiesLoading] = useState(false);
  const [identitiesError, setIdentitiesError] = useState<string | null>(null);

  const persistUser = useCallback((next: User | null) => {
    setUser(next);
    if (next) {
      localStorage.setItem(API_CONSTANTS.USER_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(API_CONSTANTS.USER_KEY);
    }
  }, []);

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
      console.error("loadUser error:", err);
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
        console.error("Error initializing auth:", error);
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
      setIsLoading(true);
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
      console.error("Login error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred during login",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    data: SignupData,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
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
      console.error("Signup error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred during signup",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const beginOAuth = useCallback(
    async (provider: OAuthProvider) => {
      await startOAuth(provider);
      await refreshSession();
    },
    [refreshSession],
  );

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      persistUser(null);
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
      console.error("Update profile error:", error);
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
      login,
      signup,
      logout,
      updateProfile,
      loadUser,
      loadIdentities,
      refreshSession,
      beginOAuth,
      isLoading,
    }),
    [
      user,
      lastSignInMethod,
      identities,
      identitiesLoading,
      identitiesError,
      login,
      signup,
      logout,
      updateProfile,
      loadUser,
      loadIdentities,
      refreshSession,
      beginOAuth,
      isLoading,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
