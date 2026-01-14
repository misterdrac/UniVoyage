import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/types/user';
import { apiService } from '@/services/api';
import { API_CONSTANTS } from '@/lib/constants';
import { clearAllPlacesCache } from '@/lib/placesCache';
import { clearAllWeatherCache } from '@/lib/weatherCache';
import { clearAllTripData } from '@/lib/tripCacheUtils';
import { clearAllHotelCache } from '@/lib/hotelsCache';

/**
 * Signup data structure for user registration
 */
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

/**
 * Authentication context type
 * Provides user authentication state and operations
 */
interface AuthContextType {
  /** Current authenticated user, or null if not logged in */
  user: User | null;
  /** Login with email and password */
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  /** Register a new user account */
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  /** Logout the current user */
  logout: () => void;
  /** Update user profile information */
  updateProfile: (data: {
    name?: string;
    surname?: string;
    countryCode?: string;
    hobbyIds?: number[];
    languageCodes?: string[];
    visitedCountryCodes?: string[];
    profileImagePath?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  /** Reload current user data from server */
  loadUser: () => Promise<User | null>;
  /** Loading state for authentication operations */
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook to access authentication context
 * @returns AuthContextType with user state and authentication methods
 * @throws Error if used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Context provider for user authentication state
 * Manages user session, login, logout, signup, and profile updates
 * Automatically initializes user session on mount by checking for existing authentication
 * 
 * @example
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing user session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await apiService.getCurrentUser();
        if (user) {
          setUser(user);
          // Also save to localStorage for consistency
          localStorage.setItem(API_CONSTANTS.USER_KEY, JSON.stringify(user));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear any invalid tokens
        localStorage.removeItem(API_CONSTANTS.USER_KEY);
        localStorage.removeItem(API_CONSTANTS.AUTH_TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Authenticates user with email and password
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise resolving to success status and optional error message
   */
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      const result = await apiService.login(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem(API_CONSTANTS.USER_KEY, JSON.stringify(result.user));
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred during login' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registers a new user account
   * @param data - Signup data including email, password, and optional profile fields
   * @returns Promise resolving to success status and optional error message
   */
  const signup = async (data: SignupData): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      if (!data.email || !data.password) {
        return { success: false, error: 'Email and password are required' };
      }

      const result = await apiService.register(data);
      
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem(API_CONSTANTS.USER_KEY, JSON.stringify(result.user));
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Signup failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred during signup' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reloads current user data from the server
   * Updates local user state and localStorage
   * @returns Promise resolving to User object or null if not authenticated
   */
  const loadUser = async (): Promise<User | null> => {
      try {
        const me = await apiService.getCurrentUser()
        if (me) {
          setUser(me)
          localStorage.setItem(API_CONSTANTS.USER_KEY, JSON.stringify(me))
          return me
        }
        setUser(null)
        return null
      } catch (err) {
        console.error("loadUser error:", err)
        setUser(null)
        return null
      }
  };

  /**
   * Logs out the current user
   * Clears user state and removes ALL data from localStorage
   */
  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      
      // Clear authentication data
      localStorage.removeItem(API_CONSTANTS.USER_KEY);
      localStorage.removeItem(API_CONSTANTS.AUTH_TOKEN_KEY);
      
      // Clear all cached data using utility functions
      clearAllTripData();
      clearAllPlacesCache();
      clearAllWeatherCache();
      clearAllHotelCache();
    }
  };

  /**
   * Updates user profile information
   * @param data - Profile update data (all fields optional)
   * @returns Promise resolving to success status and optional error message
   */
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

      const result = await apiService.updateProfile({
        name: data.name,
        surname: data.surname,
        countryCode: data.countryCode,
        hobbyIds: data.hobbyIds,
        languageCodes: data.languageCodes,
        visitedCountryCodes: data.visitedCountryCodes,
        profileImagePath: data.profileImagePath,
      });
      
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem(API_CONSTANTS.USER_KEY, JSON.stringify(result.user));
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Update failed' };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred during update' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    updateProfile,
    loadUser,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
