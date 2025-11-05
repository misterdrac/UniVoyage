// API Configuration
export const API_CONFIG = {
  // Base URL for API calls
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  
  // Use mock data or real API
  USE_MOCK: import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL,
  
  // API endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
      GOOGLE: '/auth/google',
      GOOGLE_CALLBACK: '/auth/google/callback',
    },
    USER: {
      UPDATE_PROFILE: '/user/profile',
      UPDATE_PROFILE_PICTURE: '/user/profile-picture',
    }
  },
  
  // Request timeout
  TIMEOUT: 10000,
};

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: any;
  token?: string;
  error?: string;
}

// Error types
export class ApiError extends Error {
  status?: number;
  code?: string;

  constructor(
    message: string,
    status?: number,
    code?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}
