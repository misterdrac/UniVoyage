/**
 * API Configuration
 * Centralized configuration for API base URL, endpoints, and response types
 */
export const API_CONFIG = {
  // Base URL for API calls
  // In development, use relative path so Vite proxy handles it
  // In production, use full URL or environment variable
  //BASE_URL: import.meta.env.VITE_API_URL || 'https://univoyage-production-d7c5.up.railway.app/api',

  BASE_URL: "/api",
  // API endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
      LOGOUT: "/auth/logout",
      ME: "/auth/me",
      GOOGLE: "/auth/google",
      GOOGLE_CALLBACK: "/auth/google/callback",
      GITHUB: "/auth/github",
      GITHUB_CALLBACK: "/auth/github/callback",
      LINKEDIN: "/auth/linkedin",
      LINKEDIN_CALLBACK: "/auth/linkedin/callback",
      IDENTITIES: "/auth/identities",
      OTP_REQUEST: "/auth/otp/request",
      OTP_RESEND: "/auth/otp/resend",
      OTP_VERIFY: "/auth/otp/verify",
      PASSWORD_FORGOT: "/auth/password/forgot",
      PASSWORD_RESET: "/auth/password/reset",
      EMAIL_VERIFICATION_REQUEST: "/auth/email/verification/request",
      EMAIL_VERIFICATION_CONFIRM: "/auth/email/verification/confirm",
      ADMIN_2FA_CHALLENGE: "/auth/2fa/challenge",
      ADMIN_2FA_VERIFY: "/auth/2fa/verify",
    },
    USER: {
      UPDATE_PROFILE: "/user/profile",
      UPDATE_PROFILE_PICTURE: "/user/profile-picture",
    },
    TRIPS: {
      CREATE: "/trips",
      GET_ALL: "/trips",
      GET_BY_ID: "/trips",
      UPDATE: "/trips",
      DELETE: "/trips",
      BUDGET: "/trips", // budget sub-resources
    },
    DESTINATIONS: {
      GET_ALL: "/destinations",
      SEARCH: "/destinations/search",
      REVIEWS: "/destinations",
    },
    WEATHER: {
      CURRENT: "/weather/current",
      FORECAST: "/weather/forecast",
    },
    PLACES: {
      SEARCH: "/places/search",
    },
    AI: {
      ITINERARY: "/ai/itinerary",
      PACKING: "/ai/packing",
      BUDGET_ESTIMATE: "/ai/budget-estimate",
      STATUS: "/ai/status",
    },
    HOTELS: {
      SEARCH: "/hotels/search",
      STATUS: "/hotels/status",
    },
    HEATMAP: {
      GET: "/heatmap",
    },
    QUIZ: {
      RECOMMEND: "/quiz/recommend",
    },
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
  retryAfterSeconds?: number;
}

export interface AuthResponse<TUser = unknown> {
  success: boolean;
  user?: TUser;
  token?: string;
  csrfToken?: string;
  error?: string;
  retryAfterSeconds?: number;
}

// Error types
export class ApiError extends Error {
  status?: number;
  code?: string;
  retryAfterSeconds?: number;

  constructor(
    message: string,
    status?: number,
    code?: string,
    retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
