import { API_CONFIG, type ApiResponse, type AuthResponse, ApiError } from '@/config/api';
import type { User } from '@/data/mockUsers';
import { API_CONSTANTS } from '@/lib/constants';
import { authenticateUser, createUser } from '@/data/mockUsers';

class ApiService {
  private baseURL: string;
  private useMock: boolean;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.useMock = API_CONFIG.USE_MOCK;
  }

  // Get auth token from localStorage
  private getAuthToken(): string | null {
    return localStorage.getItem(API_CONSTANTS.AUTH_TOKEN_KEY);
  }

  // Set auth token in localStorage
  private setAuthToken(token: string): void {
    localStorage.setItem(API_CONSTANTS.AUTH_TOKEN_KEY, token);
  }

  // Remove auth token from localStorage
  private removeAuthToken(): void {
    localStorage.removeItem(API_CONSTANTS.AUTH_TOKEN_KEY);
  }

  // Get headers for API requests
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  // Generic API request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    if (this.useMock) {
      throw new Error('Mock mode - use mock service instead');
    }

    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error || data.message || 'Request failed',
          response.status,
          data.code
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error'
      );
    }
  }

  // Auth API methods
  async login(email: string, password: string): Promise<AuthResponse> {
    if (this.useMock) {
      const user = authenticateUser(email, password);
      if (user) {
        const token = `mock_token_${Date.now()}`;
        this.setAuthToken(token);
        return { success: true, user, token };
      }
      return { success: false, error: 'Invalid email or password' };
    }

    const response = await this.request<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );

    if (response.success && response.data?.token) {
      this.setAuthToken(response.data.token);
    }

    return response.data || response;
  }

  async register(data: { email: string; password: string; name?: string; hobbies?: string[]; languages?: string[]; country?: string }): Promise<AuthResponse> {
    if (this.useMock) {
      try {
        const user = createUser(data.email, data.password, data.name, data.hobbies, data.languages);
        
        // Set country if provided
        if (data.country) {
          user.country = data.country;
        }
        
        const token = `mock_token_${Date.now()}`;
        this.setAuthToken(token);
        return { success: true, user, token };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Registration failed' 
        };
      }
    }

    const response = await this.request<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    if (response.success && response.data?.token) {
      this.setAuthToken(response.data.token);
    }

    return response.data || response;
  }

  async logout(): Promise<{ success: boolean }> {
    if (this.useMock) {
      this.removeAuthToken();
      return { success: true };
    }

    try {
      await this.request(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
      });
    } catch (error) {
      // Even if logout fails on server, clear local token
      console.warn('Logout request failed:', error);
    } finally {
      this.removeAuthToken();
    }

    return { success: true };
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.useMock) {
      const token = this.getAuthToken();
      if (!token) return null;
      
      // In mock mode, get user from localStorage
      const savedUser = localStorage.getItem(API_CONSTANTS.USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    }

    try {
      const response = await this.request<{ user: User }>(
        API_CONFIG.ENDPOINTS.AUTH.ME
      );
      return response.data?.user || null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  async googleAuth(): Promise<void> {
    if (this.useMock) {
      throw new Error('Google auth not available in mock mode');
    }

    // Redirect to Google OAuth
    window.location.href = `${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.GOOGLE}`;
  }

  async googleCallback(code: string): Promise<AuthResponse> {
    if (this.useMock) {
      throw new Error('Google auth not available in mock mode');
    }

    const response = await this.request<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.GOOGLE_CALLBACK,
      {
        method: 'POST',
        body: JSON.stringify({ code }),
      }
    );

    if (response.success && response.data?.token) {
      this.setAuthToken(response.data.token);
    }

    return response.data || response;
  }
}

// Export singleton instance
export const apiService = new ApiService();
