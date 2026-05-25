import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import OAuthCallbackPage from "@/pages/OAuthCallbackPage";
import { AuthProvider } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import { API_CONSTANTS } from "@/lib/constants";
import { mockWindowLocation } from "@/test/mockWindowLocation";
import {
  clearSessionCookies,
  hasAuthTokenInStorage,
  hasSessionCookies,
  readCookie,
  setSessionCookies,
} from "@/test/sessionCookies";
import type { User } from "@/types/user";

vi.mock("@/config/routes", () => ({
  ROUTE_PATHS: {
    HOME: "/",
    PROFILE: "/profile",
    GOOGLE_CALLBACK: "/auth/google/callback",
  },
}));

vi.mock("@/lib/auth/authToast", () => ({
  authToast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

vi.mock("@/services/api", () => ({
  apiService: {
    getCurrentUser: vi.fn(),
    getIdentities: vi.fn(),
    oauthCallback: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

const mockUser: User = {
  id: 1,
  name: "OAuth",
  email: "oauth-e2e@example.com",
  role: "USER",
  hobbies: [],
  languages: [],
  visitedCountries: [],
};

function renderOAuthCallback(initialPath = "/auth/google/callback") {
  const router = createMemoryRouter(
    [
      {
        path: "/auth/:provider/callback",
        element: (
          <AuthProvider>
            <OAuthCallbackPage />
          </AuthProvider>
        ),
      },
      { path: "/", element: <div>Home page</div> },
    ],
    { initialEntries: [initialPath] },
  );

  const view = render(<RouterProvider router={router} />);
  return { router, ...view };
}

describe("OAuth callback E2E", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    clearSessionCookies();
    Object.defineProperty(window, "opener", {
      configurable: true,
      writable: true,
      value: null,
    });

    vi.mocked(apiService.getCurrentUser).mockResolvedValue(null);
    vi.mocked(apiService.getIdentities).mockResolvedValue([]);
  });

  afterEach(() => {
    localStorage.clear();
    clearSessionCookies();
  });

  it("successful callback: exchanges code, persists session (storage + cookies), navigates home", async () => {
    mockWindowLocation({
      search: "?code=oauth-code-123&state=signed-state-xyz",
      pathname: "/auth/google/callback",
      href: "http://localhost:5173/auth/google/callback?code=oauth-code-123&state=signed-state-xyz",
    });

    vi.mocked(apiService.oauthCallback).mockImplementation(async () => {
      localStorage.setItem(API_CONSTANTS.AUTH_TOKEN_KEY, "e2e-jwt-token");
      setSessionCookies("e2e-jwt-token", "e2e-csrf-token");
      return {
        success: true,
        token: "e2e-jwt-token",
        user: mockUser,
      };
    });

    vi.mocked(apiService.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(apiService.getIdentities).mockResolvedValue([
      { provider: "password", label: "Email & password" },
      { provider: "google", label: "Google", linkedAt: "2024-01-01T00:00:00Z" },
    ]);

    const { router, unmount } = renderOAuthCallback(
      "/auth/google/callback?code=oauth-code-123&state=signed-state-xyz",
    );

    await waitFor(() => {
      expect(apiService.oauthCallback).toHaveBeenCalledWith(
        "google",
        "oauth-code-123",
        "signed-state-xyz",
      );
    });

    await waitFor(() => {
      expect(router.state.location.search).toBe("");
      expect(hasAuthTokenInStorage()).toBe(true);
      expect(localStorage.getItem(API_CONSTANTS.AUTH_TOKEN_KEY)).toBe(
        "e2e-jwt-token",
      );
      expect(hasSessionCookies()).toBe(true);
      expect(readCookie(API_CONSTANTS.CSRF_COOKIE_NAME)).toBe("e2e-csrf-token");
    });

    await waitFor(() => {
      expect(screen.getByText("Home page")).toBeInTheDocument();
    });

    unmount();
  });

  it("provider access_denied: shows error UI without session cookies or token", async () => {
    mockWindowLocation({
      search: "?error=access_denied&error_description=User%20denied",
      pathname: "/auth/google/callback",
    });

    renderOAuthCallback("/auth/google/callback");

    await waitFor(() => {
      expect(screen.getByText(/Sign-in didn't complete/i)).toBeInTheDocument();
      expect(screen.getByText(/cancelled/i)).toBeInTheDocument();
    });

    expect(apiService.oauthCallback).not.toHaveBeenCalled();
    expect(hasAuthTokenInStorage()).toBe(false);
    expect(hasSessionCookies()).toBe(false);
    expect(readCookie(API_CONSTANTS.AUTH_TOKEN_KEY)).toBeNull();
  });

  it("backend callback failure: no session persisted", async () => {
    mockWindowLocation({
      search: "?code=bad-code&state=bad-state",
      pathname: "/auth/google/callback",
    });

    vi.mocked(apiService.oauthCallback).mockResolvedValue({
      success: false,
      error: "Invalid or expired OAuth state",
    });

    renderOAuthCallback("/auth/google/callback");

    await waitFor(() => {
      expect(apiService.oauthCallback).toHaveBeenCalled();
      expect(screen.getByText(/expired|interrupted/i)).toBeInTheDocument();
    });

    expect(hasAuthTokenInStorage()).toBe(false);
    expect(hasSessionCookies()).toBe(false);
  });
});
