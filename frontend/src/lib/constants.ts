// Validation constants
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_PASSWORD_LENGTH: 3,
} as const;

// API constants
export const API_CONSTANTS = {
  AUTH_TOKEN_KEY: "auth_token",
  USER_KEY: "user",
  CSRF_COOKIE_NAME: "csrf_token",
  DEFAULT_TIMEOUT: 10000,
} as const;
