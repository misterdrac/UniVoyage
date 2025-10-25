import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/data/mockUsers';
import { apiService } from '@/services/api';
import { API_CONSTANTS } from '@/lib/constants';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  const signup = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      const result = await apiService.register(email, password);
      
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

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem(API_CONSTANTS.USER_KEY);
      localStorage.removeItem(API_CONSTANTS.AUTH_TOKEN_KEY);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
