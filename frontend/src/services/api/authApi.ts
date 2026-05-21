import { API_CONFIG, ApiError, type AuthResponse } from "@/config/apiConfig";
import { beginOAuth as runBeginOAuth } from "@/lib/oauth";
import type {
  EmailOtpPurpose,
  LinkedIdentity,
  OAuthProvider,
} from "@/types/auth";
import type { User } from "@/types/user";
import type { BackendLinkedIdentityDto, BackendUserDto } from "./types";
import type { ApiClient } from "./baseClient";
import { OAUTH_PROVIDER_CONFIG } from "@/lib/oauth/constants";

/**
 * Normalizes authentication error messages for better user experience
 * Maps backend error messages to user-friendly frontend messages
 * Direct mapping of backend error messages from AuthService and AuthController
 */
function normalizeAuthError(error: string): string {
  if (!error || typeof error !== "string") {
    return "An error occurred. Please try again.";
  }

  const lowerError = error.toLowerCase();

  // Backend returns: "Email is already in use" from AuthService.register()
  if (
    lowerError.includes("email") &&
    lowerError.includes("already") &&
    lowerError.includes("use")
  ) {
    return "This email is already registered. Please use a different email or sign in.";
  }

  // Backend returns: "Invalid credentials" from AuthService.login() (user not found or wrong password)
  if (lowerError.includes("invalid") && lowerError.includes("credential")) {
    return "Invalid email or password. Please check your credentials and try again.";
  }

  // Backend returns: "Invalid email or password" from AuthController.login()
  if (
    lowerError.includes("invalid") &&
    (lowerError.includes("email") || lowerError.includes("password"))
  ) {
    return "Invalid email or password. Please check your credentials and try again.";
  }

  // Backend returns: "Country code is required" from AuthService.register()
  if (
    lowerError.includes("country") &&
    (lowerError.includes("required") || lowerError.includes("code"))
  ) {
    return "Country is required. Please select your country.";
  }

  // Backend returns: "Invalid country code: XX" from IllegalArgumentException
  if (lowerError.includes("invalid") && lowerError.includes("country code")) {
    return "Invalid country selected. Please choose a valid country.";
  }

  // Backend returns: "Invalid hobby id: X" from IllegalArgumentException
  if (lowerError.includes("invalid") && lowerError.includes("hobby")) {
    return "Invalid hobby selected. Please choose valid hobbies.";
  }

  // Backend returns: "Invalid language code: XX" from IllegalArgumentException
  if (lowerError.includes("invalid") && lowerError.includes("language code")) {
    return "Invalid language selected. Please choose valid languages.";
  }

  // Backend returns: "Invalid visited country code: XX" from IllegalArgumentException
  if (
    lowerError.includes("invalid") &&
    lowerError.includes("visited country")
  ) {
    return "Invalid visited country selected. Please choose valid countries.";
  }

  // Backend returns: "Registration failed" from AuthController.register() (generic wrapper)
  if (lowerError.includes("registration failed")) {
    return "Registration failed. Please check your information and try again.";
  }

  // Network errors
  if (
    lowerError.includes("network") ||
    lowerError.includes("fetch") ||
    lowerError.includes("connection") ||
    lowerError.includes("failed to fetch")
  ) {
    return "Network error. Please check your connection and try again.";
  }

  // Server errors (500 from IllegalArgumentException exceptions)
  if (
    lowerError.includes("server error") ||
    lowerError.includes("500") ||
    lowerError.includes("internal")
  ) {
    return "Server error. Please try again later.";
  }

  // Return original error if no match found
  return error;
}

function normalizeOtpError(error: string): string {
  if (!error || typeof error !== "string") {
    return "We could not send or verify your code. Please try again.";
  }

  const lowerError = error.toLowerCase();

  if (
    lowerError.includes("invalid") ||
    lowerError.includes("expired") ||
    lowerError.includes("verification code") ||
    lowerError.includes("wrong code")
  ) {
    return "That code did not work. Check the 6 digits or request a new code.";
  }

  if (
    lowerError.includes("too many") ||
    lowerError.includes("rate") ||
    lowerError.includes("429")
  ) {
    return "Too many attempts. Please wait a little before trying again.";
  }

  if (
    lowerError.includes("unable to complete") ||
    lowerError.includes("register first") ||
    lowerError.includes("cannot complete")
  ) {
    return "We could not complete email-code sign-in. Try another sign-in method.";
  }

  if (
    lowerError.includes("network") ||
    lowerError.includes("fetch") ||
    lowerError.includes("connection") ||
    lowerError.includes("server") ||
    lowerError.includes("500") ||
    lowerError.includes("internal")
  ) {
    return "We could not send or verify your code. Please try again.";
  }

  return "We could not send or verify your code. Please try again.";
}

function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null) {
    const { message, error: nestedError } = error as {
      message?: unknown;
      error?: unknown;
    };
    if (typeof message === "string") return message;
    if (typeof nestedError === "string") return nestedError;
  }
  return fallback;
}

function getAuthErrorStatus(error: unknown): number | undefined {
  return error instanceof ApiError ? error.status : undefined;
}

function getAuthRetryAfterSeconds(error: unknown): number | undefined {
  return error instanceof ApiError ? error.retryAfterSeconds : undefined;
}

const otpGenericError =
  "We could not send or verify your code. Please try again.";
const otpInvalidCodeError =
  "That code did not work. Check the 6 digits or request a new code.";
const otpRateLimitError =
  "Too many attempts. Please wait a little before trying again.";
const emailActionGenericError =
  "We could not complete that request. Please try again.";
const passwordResetInvalidLinkError =
  "This reset link did not work. Request a new password reset email.";
const emailVerificationInvalidLinkError =
  "This verification link did not work. Request a new verification email.";
const emailActionRateLimitError =
  "Too many attempts. Please wait a little before trying again.";
const adminTwoFactorGenericError =
  "We could not complete admin verification. Please try again.";
const adminTwoFactorInvalidCodeError =
  "That code did not work. Check the 6 digits or request a new code.";
const adminTwoFactorRateLimitError =
  "Too many attempts. Please wait a little before trying again.";

export interface OtpAcceptedResponse {
  success: boolean;
  message?: string;
  error?: string;
  retryAfterSeconds?: number;
}

export interface EmailActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  retryAfterSeconds?: number;
}

type BackendOtpAcceptedResponse = {
  message?: string;
};

type BackendEmailActionResponse = {
  message?: string;
};

function emailActionFromResponse(
  response: {
    success: boolean;
    data?: BackendEmailActionResponse;
    error?: string;
  },
  defaultMessage?: string,
): EmailActionResponse {
  return {
    success: response.success,
    message: response.data?.message || defaultMessage,
    error: response.error ? emailActionGenericError : undefined,
  };
}

function emailActionFailure(
  error: unknown,
  fallback: string,
  invalidLinkMessage?: string,
): EmailActionResponse {
  const retryAfterSeconds = getAuthRetryAfterSeconds(error);
  const status = getAuthErrorStatus(error);

  if (status === 429) {
    return {
      success: false,
      error: emailActionRateLimitError,
      retryAfterSeconds,
    };
  }

  if (status === 400 && invalidLinkMessage) {
    return { success: false, error: invalidLinkMessage };
  }

  const rawError = getAuthErrorMessage(error, fallback);
  return {
    success: false,
    error: rawError ? emailActionGenericError : fallback,
  };
}

/**
 * Authentication API interface
 * Handles user login, registration, logout, and OAuth flows
 */
export interface AuthApi {
  /**
   * Authenticates user with email and password
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise resolving to auth response with user data and token
   */
  login(email: string, password: string): Promise<AuthResponse<User>>;

  /**
   * Registers a new user account
   * @param data - Registration data including email, password, and optional profile fields
   * @returns Promise resolving to auth response with user data and token
   */
  register(data: {
    email: string;
    password: string;
    name?: string;
    surname?: string;
    countryCode?: string;
    hobbyIds?: number[];
    languageCodes?: string[];
    visitedCountryCodes?: string[];
  }): Promise<AuthResponse<User>>;

  /** Requests an email OTP for passwordless sign-in/sign-up. */
  requestEmailOtp(
    email: string,
    purpose?: EmailOtpPurpose,
  ): Promise<OtpAcceptedResponse>;

  /** Resends an active email OTP challenge when allowed by backend policy. */
  resendEmailOtp(
    email: string,
    purpose?: EmailOtpPurpose,
  ): Promise<OtpAcceptedResponse>;

  /** Verifies a 6-digit email OTP and returns the normal auth payload. */
  verifyEmailOtp(
    email: string,
    code: string,
    purpose?: EmailOtpPurpose,
  ): Promise<AuthResponse<User>>;

  /** Requests password reset instructions by email. */
  requestPasswordReset(email: string): Promise<EmailActionResponse>;

  /** Completes password reset using a token from an email deep link. */
  resetPassword(
    token: string,
    newPassword: string,
  ): Promise<EmailActionResponse>;

  /** Requests email verification instructions by email. */
  requestEmailVerification(email: string): Promise<EmailActionResponse>;

  /** Confirms an email verification token from an email deep link. */
  confirmEmailVerification(token: string): Promise<EmailActionResponse>;

  /** Requests an admin 2FA email code for the current admin session. */
  requestAdminTwoFactor(): Promise<EmailActionResponse>;

  /** Verifies an admin 2FA email code for the current admin session. */
  verifyAdminTwoFactor(code: string): Promise<EmailActionResponse>;

  /**
   * Logs out the current user
   * Clears authentication token from storage
   * @returns Promise resolving to success status
   */
  logout(): Promise<{ success: boolean }>;

  /**
   * Retrieves the currently authenticated user
   * @returns Promise resolving to User object or null if not authenticated
   */
  getCurrentUser(): Promise<User | null>;

  /**
   * @deprecated Use {@link beginOAuth} from `@/lib/oauth` or `useAuth().beginOAuth`.
   */
  googleAuth(): Promise<void>;

  /**
   * @deprecated Use {@link oauthCallback}.
   */
  googleCallback(code: string, state?: string): Promise<AuthResponse<User>>;

  /** Starts OAuth for the given provider (popup). */
  beginOAuth(provider: OAuthProvider): Promise<void>;

  /** Exchanges authorization code (+ state) after OAuth redirect. */
  oauthCallback(
    provider: OAuthProvider,
    code: string,
    state?: string,
  ): Promise<AuthResponse<User>>;

  /** Linked sign-in methods for the current user (read-only). */
  getIdentities(): Promise<LinkedIdentity[]>;
}

export const authApi: {
  [K in keyof AuthApi]: (
    this: ApiClient,
    ...args: Parameters<AuthApi[K]>
  ) => ReturnType<AuthApi[K]>;
} = {
  async login(this: ApiClient, email, password) {
    try {
      const response = await this.request<AuthResponse<BackendUserDto>>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        },
      );

      const payload = this.adaptAuthPayload(response.data);

      if (payload.success) {
        if (payload.token) {
          this.setAuthToken(payload.token);
        }
        return payload;
      }

      // Normalize error messages for better UX
      const rawError = payload.error || response.error || "Login failed";
      const normalizedError = normalizeAuthError(rawError);
      return {
        success: false,
        error: normalizedError,
      };
    } catch (error: unknown) {
      // Handle ApiError and network errors
      // ApiError has message property, also check error property for nested errors
      const rawError = getAuthErrorMessage(error, "Login failed");
      const normalizedError = normalizeAuthError(rawError);
      return {
        success: false,
        error: normalizedError,
      };
    }
  },

  async register(this: ApiClient, data) {
    try {
      const res = await this.request<AuthResponse<BackendUserDto>>(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name || "",
            surname: data.surname,
            email: data.email,
            countryCode: data.countryCode || null,
            hobbyIds: data.hobbyIds ?? [],
            languageCodes: data.languageCodes ?? [],
            password: data.password,
            visitedCountryCodes: data.visitedCountryCodes ?? [],
          }),
        },
      );

      const payload = this.adaptAuthPayload(res.data);
      if (payload.success) {
        if (payload.token) {
          this.setAuthToken(payload.token);
        }
        return payload;
      }

      // Normalize error messages for better UX
      const rawError =
        payload.error || res.error || res.message || "Registration failed";
      const normalizedError = normalizeAuthError(rawError);
      return { success: false, error: normalizedError };
    } catch (err: unknown) {
      // Handle ApiError and network errors
      // ApiError has message property, also check error property for nested errors
      const rawError = getAuthErrorMessage(err, "Registration failed");
      const normalizedError = normalizeAuthError(rawError);
      return { success: false, error: normalizedError };
    }
  },

  async requestEmailOtp(this: ApiClient, email, purpose = "REGISTER") {
    try {
      const response = await this.request<BackendOtpAcceptedResponse>(
        API_CONFIG.ENDPOINTS.AUTH.OTP_REQUEST,
        {
          method: "POST",
          body: JSON.stringify({ email, purpose }),
        },
      );

      return {
        success: response.success,
        message:
          response.data?.message ||
          "If this email can receive messages, a verification code has been sent.",
        error: response.error ? normalizeOtpError(response.error) : undefined,
      };
    } catch (error: unknown) {
      const rawError = getAuthErrorMessage(error, "Email code request failed");
      const retryAfterSeconds = getAuthRetryAfterSeconds(error);
      return {
        success: false,
        error:
          getAuthErrorStatus(error) === 429
            ? otpRateLimitError
            : normalizeOtpError(rawError),
        retryAfterSeconds,
      };
    }
  },

  async resendEmailOtp(this: ApiClient, email, purpose = "REGISTER") {
    try {
      const response = await this.request<BackendOtpAcceptedResponse>(
        API_CONFIG.ENDPOINTS.AUTH.OTP_RESEND,
        {
          method: "POST",
          body: JSON.stringify({ email, purpose }),
        },
      );

      return {
        success: response.success,
        message:
          response.data?.message ||
          "If this email can receive messages, a verification code has been sent.",
        error: response.error ? normalizeOtpError(response.error) : undefined,
      };
    } catch (error: unknown) {
      const rawError = getAuthErrorMessage(error, "Email code resend failed");
      const retryAfterSeconds = getAuthRetryAfterSeconds(error);
      return {
        success: false,
        error:
          getAuthErrorStatus(error) === 429
            ? otpRateLimitError
            : normalizeOtpError(rawError),
        retryAfterSeconds,
      };
    }
  },

  async verifyEmailOtp(this: ApiClient, email, code, purpose = "REGISTER") {
    try {
      const response = await this.request<AuthResponse<BackendUserDto>>(
        API_CONFIG.ENDPOINTS.AUTH.OTP_VERIFY,
        {
          method: "POST",
          body: JSON.stringify({ email, purpose, code }),
        },
      );

      const payload = this.adaptAuthPayload(response.data);
      if (payload.success) {
        if (payload.token) {
          this.setAuthToken(payload.token);
        }
        return payload;
      }

      const rawError =
        payload.error || response.error || "Email code verification failed";
      return { success: false, error: normalizeOtpError(rawError) };
    } catch (error: unknown) {
      const rawError = getAuthErrorMessage(
        error,
        "Email code verification failed",
      );
      const retryAfterSeconds = getAuthRetryAfterSeconds(error);
      if (getAuthErrorStatus(error) === 429) {
        return {
          success: false,
          error: otpRateLimitError,
          retryAfterSeconds,
        };
      }
      if (getAuthErrorStatus(error) === 400) {
        return { success: false, error: otpInvalidCodeError };
      }
      return {
        success: false,
        error: normalizeOtpError(rawError) || otpGenericError,
        retryAfterSeconds,
      };
    }
  },

  async requestPasswordReset(this: ApiClient, email) {
    const defaultMessage =
      "If an account exists for this email, password reset instructions have been sent.";
    try {
      const response = await this.request<BackendEmailActionResponse>(
        API_CONFIG.ENDPOINTS.AUTH.PASSWORD_FORGOT,
        {
          method: "POST",
          body: JSON.stringify({ email }),
        },
      );

      return emailActionFromResponse(response, defaultMessage);
    } catch (error: unknown) {
      return emailActionFailure(error, "Password reset request failed");
    }
  },

  async resetPassword(this: ApiClient, token, newPassword) {
    try {
      await this.request<void>(API_CONFIG.ENDPOINTS.AUTH.PASSWORD_RESET, {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      });

      return { success: true };
    } catch (error: unknown) {
      return emailActionFailure(
        error,
        "Password reset failed",
        passwordResetInvalidLinkError,
      );
    }
  },

  async requestEmailVerification(this: ApiClient, email) {
    const defaultMessage =
      "If an account exists for this email, verification instructions have been sent.";
    try {
      const response = await this.request<BackendEmailActionResponse>(
        API_CONFIG.ENDPOINTS.AUTH.EMAIL_VERIFICATION_REQUEST,
        {
          method: "POST",
          body: JSON.stringify({ email }),
        },
      );

      return emailActionFromResponse(response, defaultMessage);
    } catch (error: unknown) {
      return emailActionFailure(error, "Email verification request failed");
    }
  },

  async confirmEmailVerification(this: ApiClient, token) {
    try {
      await this.request<void>(
        API_CONFIG.ENDPOINTS.AUTH.EMAIL_VERIFICATION_CONFIRM,
        {
          method: "POST",
          body: JSON.stringify({ token }),
        },
      );

      return { success: true };
    } catch (error: unknown) {
      return emailActionFailure(
        error,
        "Email verification failed",
        emailVerificationInvalidLinkError,
      );
    }
  },

  async requestAdminTwoFactor(this: ApiClient) {
    try {
      const response = await this.request<BackendEmailActionResponse>(
        API_CONFIG.ENDPOINTS.AUTH.ADMIN_2FA_CHALLENGE,
        {
          method: "POST",
        },
      );

      return {
        success: response.success,
        message:
          response.data?.message || "Verification code sent to your email.",
        error: response.error ? adminTwoFactorGenericError : undefined,
      };
    } catch (error: unknown) {
      const retryAfterSeconds = getAuthRetryAfterSeconds(error);
      return {
        success: false,
        error:
          getAuthErrorStatus(error) === 429
            ? adminTwoFactorRateLimitError
            : adminTwoFactorGenericError,
        retryAfterSeconds,
      };
    }
  },

  async verifyAdminTwoFactor(this: ApiClient, code) {
    try {
      const response = await this.request<BackendEmailActionResponse>(
        API_CONFIG.ENDPOINTS.AUTH.ADMIN_2FA_VERIFY,
        {
          method: "POST",
          body: JSON.stringify({ code }),
        },
      );

      return {
        success: response.success,
        message:
          response.data?.message || "Two-factor authentication verified.",
        error: response.error ? adminTwoFactorGenericError : undefined,
      };
    } catch (error: unknown) {
      const retryAfterSeconds = getAuthRetryAfterSeconds(error);
      const status = getAuthErrorStatus(error);

      if (status === 429) {
        return {
          success: false,
          error: adminTwoFactorRateLimitError,
          retryAfterSeconds,
        };
      }

      if (status === 400) {
        return { success: false, error: adminTwoFactorInvalidCodeError };
      }

      return {
        success: false,
        error: adminTwoFactorGenericError,
        retryAfterSeconds,
      };
    }
  },

  async logout(this: ApiClient) {
    try {
      await this.request(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
        method: "POST",
      });
    } catch (error) {
      console.warn("Logout request failed:", error);
    } finally {
      this.removeAuthToken();
    }

    return { success: true };
  },

  async getCurrentUser(this: ApiClient) {
    try {
      const response = await this.request<BackendUserDto>(
        API_CONFIG.ENDPOINTS.AUTH.ME,
      );
      return this.adaptUserDto(response.data) || null;
    } catch (error) {
      console.error("Failed to get current user:", error);
      return null;
    }
  },

  async googleAuth(this: ApiClient): Promise<void> {
    return runBeginOAuth("google");
  },

  async beginOAuth(this: ApiClient, provider: OAuthProvider): Promise<void> {
    void this;
    return runBeginOAuth(provider);
  },

  async oauthCallback(
    this: ApiClient,
    provider: OAuthProvider,
    code: string,
    state?: string,
  ): Promise<AuthResponse<User>> {
    const endpoint = OAUTH_PROVIDER_CONFIG[provider].callbackEndpoint;
    const body: { code: string; state?: string } = { code };
    if (state) {
      body.state = state;
    }

    const res = await this.request<AuthResponse<BackendUserDto>>(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const payload = this.adaptAuthPayload(res.data);

    if (payload.success && payload.token) {
      this.setAuthToken(payload.token);
    }

    const label = OAUTH_PROVIDER_CONFIG[provider].label;
    return payload.success
      ? payload
      : {
          success: false,
          error: payload.error || res.error || `${label} login failed`,
        };
  },

  async googleCallback(
    this: ApiClient,
    code: string,
    state?: string,
  ): Promise<AuthResponse<User>> {
    return authApi.oauthCallback.call(this, "google", code, state);
  },

  async getIdentities(this: ApiClient): Promise<LinkedIdentity[]> {
    try {
      const response = await this.request<BackendLinkedIdentityDto[]>(
        API_CONFIG.ENDPOINTS.AUTH.IDENTITIES,
      );
      return (response.data ?? []).map((row) => ({
        provider: row.provider,
        label: row.label,
        linkedAt: row.linkedAt,
      }));
    } catch (error) {
      console.error("Failed to load sign-in methods:", error);
      return [];
    }
  },
};
