// API Configuration
export const API_CONFIG = {
  // Base URL for API calls
  // In development, use relative path so Vite proxy handles it
  // In production, use full URL or environment variable
  BASE_URL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:8080/api'),
  
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
    },
    TRIPS: {
      CREATE: '/trips',
      GET_ALL: '/trips',
      GET_BY_ID: '/trips',
      UPDATE: '/trips',
      DELETE: '/trips',
      BUDGET: '/trips', // budget sub-resources
    },
            DESTINATIONS: {
              GET_ALL: '/destinations',
              SEARCH: '/destinations/search',
            },
            WEATHER: {
              CURRENT: '/weather/current',
              FORECAST: '/weather/forecast',
            },
            PLACES: {
              SEARCH: '/places/search',
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

export interface AuthResponse<TUser = any> {
  success: boolean;
  user?: TUser;
  token?: string;
  csrfToken?: string;
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
