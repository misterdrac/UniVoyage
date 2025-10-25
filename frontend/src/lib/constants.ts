// Validation constants
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_PASSWORD_LENGTH: 3,
} as const;

// API constants
export const API_CONSTANTS = {
  AUTH_TOKEN_KEY: 'auth_token',
  USER_KEY: 'user',
  DEFAULT_TIMEOUT: 10000,
} as const;

// UI constants
export const UI_CONSTANTS = {
  PROFILE_PICTURE_SIZE: {
    SMALL: 24, // Header profile picture
    LARGE: 80, // Profile page picture
  },
  TOAST_DURATION: 4000,
} as const;
