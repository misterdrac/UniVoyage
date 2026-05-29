import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import {
  createMemoryRouter,
  MemoryRouter,
  Route,
  RouterProvider,
  Routes,
  useLocation,
} from "react-router-dom";
import OAuthCallbackPage from "@/pages/OAuthCallbackPage";
import PasswordResetPage from "@/pages/PasswordResetPage";
import EmailVerificationPage from "@/pages/EmailVerificationPage";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { apiService } from "@/services/api";
import { API_CONSTANTS } from "@/lib/constants";
import { findAuthTokenLeaksInLocalStorage } from "@/lib/auth/tokenStoragePolicy";
import { mockWindowLocation } from "@/test/mockWindowLocation";
import {
  clearSessionCookies,
  hasAuthTokenInStorage,
  hasSessionCookies,
} from "@/test/sessionCookies";
import type { OAuthProvider } from "@/types/auth";
import type { User } from "@/types/user";

vi.mock("@/config/routes", () => ({
  ROUTE_PATHS: { HOME: "/", PROFILE: "/profile" },
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
    requestEmailOtp: vi.fn(),
    verifyEmailOtp: vi.fn(),
    confirmEmailVerification: vi.fn(),
    resetPassword: vi.fn(),
    requestPasswordReset: vi.fn(),
    baseURL: "/api",
  },
}));

const mockUser: User = {
  id: 1,
  name: "Matrix",
  email: "matrix@example.com",
  role: "USER",
  hobbies: [],
  languages: [],
  visitedCountries: [],
};

function renderOAuth(provider: OAuthProvider, search: string) {
  const path = `/auth/${provider}/callback${search}`;
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
    { initialEntries: [path] },
  );

  const view = render(<RouterProvider router={router} />);
  return { router, ...view };
}

describe("auth regression matrix", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    clearSessionCookies();
    Object.defineProperty(window, "opener", {
      configurable: true,
      value: null,
    });
    vi.mocked(apiService.getCurrentUser).mockResolvedValue(null);
    vi.mocked(apiService.getIdentities).mockResolvedValue([]);
  });

  afterEach(() => {
    localStorage.clear();
    clearSessionCookies();
  });

  describe.each([
    ["google", "oauth-code-google", "state-google"],
    ["github", "oauth-code-github", "state-github"],
    ["linkedin", "oauth-code-linkedin", "state-linkedin"],
  ] as const)("OAuth provider %s", (provider, code, state) => {
    it("happy path: exchanges code and clears sensitive query from router", async () => {
      mockWindowLocation({
        search: `?code=${code}&state=${state}`,
        pathname: `/auth/${provider}/callback`,
        href: `http://localhost:5173/auth/${provider}/callback?code=${code}&state=${state}`,
      });

      vi.mocked(apiService.oauthCallback).mockResolvedValue({
        success: true,
        token: "matrix-jwt",
        user: mockUser,
      });
      vi.mocked(apiService.getCurrentUser).mockResolvedValue(mockUser);

      const { router } = renderOAuth(provider, `?code=${code}&state=${state}`);

      await waitFor(() => {
        expect(apiService.oauthCallback).toHaveBeenCalledWith(
          provider,
          code,
          state,
        );
      });

      await waitFor(() => {
        expect(router.state.location.search).toBe("");
        expect(screen.getByText("Home page")).toBeInTheDocument();
      });

      expect(findAuthTokenLeaksInLocalStorage()).toEqual([]);
    });

    it("sad path: provider error leaves no session", async () => {
      mockWindowLocation({
        search: "?error=access_denied",
        pathname: `/auth/${provider}/callback`,
      });

      const { router } = renderOAuth(provider, "?error=access_denied");

      await waitFor(() => {
        expect(
          screen.getByText(/Sign-in didn't complete/i),
        ).toBeInTheDocument();
        expect(router.state.location.search).toBe("");
      });

      expect(apiService.oauthCallback).not.toHaveBeenCalled();
      expect(hasAuthTokenInStorage()).toBe(false);
      expect(hasSessionCookies()).toBe(false);
    });
  });

  it("password reset: strips token from URL after load", async () => {
    let routerSearch = "?token=reset-matrix-token";
    render(
      <MemoryRouter
        initialEntries={["/auth/reset-password?token=reset-matrix-token"]}
      >
        <Routes>
          <Route
            path="/auth/reset-password"
            element={
              <>
                <PasswordResetPage />
                <UrlProbe onSearch={(s) => (routerSearch = s)} />
              </>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(routerSearch).toBe("");
      expect(
        screen.getByRole("button", { name: /^reset password$/i }),
      ).toBeInTheDocument();
    });
  });

  it("email verification: strips token from URL while confirming", async () => {
    vi.mocked(apiService.confirmEmailVerification).mockResolvedValue({
      success: true,
    });

    let routerSearch = "?token=verify-matrix-token";
    render(
      <MemoryRouter
        initialEntries={["/auth/verify-email?token=verify-matrix-token"]}
      >
        <Routes>
          <Route
            path="/auth/verify-email"
            element={
              <>
                <EmailVerificationPage />
                <UrlProbe onSearch={(s) => (routerSearch = s)} />
              </>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(routerSearch).toBe("");
      expect(apiService.confirmEmailVerification).toHaveBeenCalledWith(
        "verify-matrix-token",
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/email verified/i)).toBeInTheDocument();
    });
  });

  describe.each([
    ["OTP request failure", "request", false],
    ["OTP verify failure", "verify", false],
  ] as const)("%s", (_label, failureAt, _expectSuccess) => {
    it("does not persist OTP material in localStorage", async () => {
      if (failureAt === "request") {
        vi.mocked(apiService.requestEmailOtp).mockResolvedValue({
          success: false,
          error: "Too many attempts",
          retryAfterSeconds: 60,
        });
      } else {
        vi.mocked(apiService.requestEmailOtp).mockResolvedValue({
          success: true,
          message: "Code sent",
        });
        vi.mocked(apiService.verifyEmailOtp).mockResolvedValue({
          success: false,
          error: "Invalid code",
        });
      }

      const user = userEvent.setup();
      render(
        <AuthProvider>
          <LoginDialog open onOpenChange={() => {}} />
        </AuthProvider>,
      );

      await user.click(
        screen.getByRole("button", { name: /email me a sign-in code/i }),
      );
      await user.type(
        screen.getByPlaceholderText(/enter your email/i),
        "otp-matrix@example.com",
      );
      await user.click(
        screen.getByRole("button", { name: /email me a code/i }),
      );

      if (failureAt === "verify") {
        await waitFor(() => {
          expect(screen.getByLabelText(/digit 1 of 6/i)).toBeInTheDocument();
        });
        const digits = screen.getAllByLabelText(/digit \d of 6/i);
        for (let i = 0; i < digits.length; i++) {
          await user.type(digits[i], String((i + 1) % 10));
        }
        await user.click(screen.getByRole("button", { name: /verify code/i }));
      }

      await waitFor(() => {
        expect(findAuthTokenLeaksInLocalStorage()).toEqual([]);
      });
      expect(localStorage.getItem("otp")).toBeNull();
      expect(localStorage.getItem(API_CONSTANTS.AUTH_TOKEN_KEY)).toBeNull();
    });
  });
});

function UrlProbe({ onSearch }: { onSearch: (search: string) => void }) {
  const { search } = useLocation();
  React.useEffect(() => {
    onSearch(search);
  }, [onSearch, search]);
  return null;
}
