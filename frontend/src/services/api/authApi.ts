import { API_CONFIG, type AuthResponse } from "@/config/apiConfig";
import { beginOAuth as runBeginOAuth } from "@/lib/oauth";
import type { LinkedIdentity, OAuthProvider } from "@/types/auth";
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
    } catch (error: any) {
      // Handle ApiError and network errors
      // ApiError has message property, also check error property for nested errors
      const rawError =
        error?.message ||
        error?.error ||
        (typeof error === "string" ? error : "Login failed");
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
    } catch (err: any) {
      // Handle ApiError and network errors
      // ApiError has message property, also check error property for nested errors
      const rawError =
        err?.message ||
        err?.error ||
        (typeof err === "string" ? err : "Registration failed");
      const normalizedError = normalizeAuthError(rawError);
      return { success: false, error: normalizedError };
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
