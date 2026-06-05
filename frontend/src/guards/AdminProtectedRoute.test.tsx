import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { AuthProvider } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import type { BackendUserDto } from "@/services/api/types";
import AdminProtectedRoute from "./AdminProtectedRoute";

const API_BASE_URL = "http://localhost/api";

let nextUserId = 100;
let currentUser: BackendUserDto | null = null;
let serverTwoFactorVerified = false;
let challengeRequests = 0;
let logoutRequests = 0;
const verifyRequests: Array<Record<string, unknown>> = [];

function makeUser(role: string): BackendUserDto {
  nextUserId += 1;
  return {
    id: nextUserId,
    name: "Admin",
    surname: "User",
    email: `admin-${nextUserId}@example.com`,
    role,
    hobbies: [],
    languages: [],
    visitedCountries: [],
  };
}

const server = setupServer(
  http.get(`${API_BASE_URL}/auth/me`, () =>
    HttpResponse.json({
      success: true,
      data: currentUser
        ? { ...currentUser, twoFactorVerified: serverTwoFactorVerified }
        : null,
      error: null,
    }),
  ),
  http.get(`${API_BASE_URL}/auth/identities`, () =>
    HttpResponse.json({
      success: true,
      data: [],
      error: null,
    }),
  ),
  http.post(`${API_BASE_URL}/auth/2fa/challenge`, () => {
    challengeRequests += 1;
    return HttpResponse.json({
      success: true,
      data: {
        message: "Verification code sent to your email.",
      },
      error: null,
    });
  }),
  http.post(`${API_BASE_URL}/auth/2fa/verify`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    verifyRequests.push(body);

    if (body.code !== "123456") {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: "Invalid verification code. 2 attempts remaining.",
        },
        { status: 400 },
      );
    }

    serverTwoFactorVerified = true;
    if (currentUser) {
      currentUser = { ...currentUser, twoFactorVerified: true };
    }
    return HttpResponse.json({
      success: true,
      data: {
        message: "Two-factor authentication verified.",
      },
      error: null,
    });
  }),
  http.post(`${API_BASE_URL}/auth/logout`, () => {
    logoutRequests += 1;
    currentUser = null;
    return HttpResponse.json({
      success: true,
      data: null,
      error: null,
    });
  }),
);

function renderAdminRoute() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <Routes>
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <div>CMS dashboard content</div>
              </AdminProtectedRoute>
            }
          />
          <Route path="/admin" element={<div>Admin login</div>} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

async function waitForChallenge() {
  expect(
    await screen.findByRole("heading", { name: /admin verification/i }),
  ).toBeInTheDocument();
  await screen.findByText(/check your email\. code expires in 10 minutes\./i);
}

async function fillCode(code: string) {
  const user = userEvent.setup();
  await user.click(screen.getByLabelText("Digit 1 of 6"));
  await user.paste(code);
  return user;
}

describe("AdminProtectedRoute 2FA gate", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

  beforeEach(() => {
    apiService.baseURL = API_BASE_URL;
    currentUser = makeUser("ADMIN");
    serverTwoFactorVerified = false;
    challengeRequests = 0;
    logoutRequests = 0;
    verifyRequests.length = 0;
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    server.resetHandlers();
    apiService.baseURL = "/api";
    localStorage.clear();
    sessionStorage.clear();
  });

  afterAll(() => server.close());

  it("blocks ADMIN users from admin content until 2FA succeeds", async () => {
    renderAdminRoute();

    await waitForChallenge();
    expect(screen.queryByText("CMS dashboard content")).not.toBeInTheDocument();
    expect(challengeRequests).toBe(1);
  });

  it("verifies the admin code, refreshes the session, and reveals CMS content", async () => {
    renderAdminRoute();
    await waitForChallenge();

    const user = await fillCode("123456");
    await user.click(
      screen.getByRole("button", { name: /verify admin access/i }),
    );

    expect(
      await screen.findByText("CMS dashboard content"),
    ).toBeInTheDocument();
    expect(verifyRequests[0]).toMatchObject({ code: "123456" });
  });

  it("keeps wrong-code failures generic and leaves resend recoverable", async () => {
    renderAdminRoute();
    await waitForChallenge();

    const user = await fillCode("000000");
    await user.click(
      screen.getByRole("button", { name: /verify admin access/i }),
    );

    expect(
      await screen.findByText(
        /that code did not work\. check the 6 digits or request a new code\./i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /resend in|resend code/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText("CMS dashboard content")).not.toBeInTheDocument();
  });

  it("shows verify lockout countdowns and preserves lock state on rerender", async () => {
    server.use(
      http.post(`${API_BASE_URL}/auth/2fa/verify`, async ({ request }) => {
        verifyRequests.push((await request.json()) as Record<string, unknown>);
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: "Too many failed attempts. Please try again later.",
          },
          { status: 429, headers: { "Retry-After": "120" } },
        );
      }),
    );

    const view = renderAdminRoute();
    await waitForChallenge();

    const user = await fillCode("123456");
    await user.click(
      screen.getByRole("button", { name: /verify admin access/i }),
    );

    expect(
      await screen.findByText(/too many attempts\. try again in 2 min\./i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /verify admin access/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /resend in|resend code/i }),
    ).toBeDisabled();

    view.rerender(
      <AuthProvider>
        <MemoryRouter initialEntries={["/admin/dashboard"]}>
          <Routes>
            <Route
              path="/admin/dashboard"
              element={
                <AdminProtectedRoute>
                  <div>CMS dashboard content</div>
                </AdminProtectedRoute>
              }
            />
            <Route path="/admin" element={<div>Admin login</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(
      screen.getByText(/too many attempts\. try again in 2 min\./i),
    ).toBeInTheDocument();
  });

  it("shows request Retry-After countdowns and disables sending", async () => {
    server.use(
      http.post(`${API_BASE_URL}/auth/2fa/challenge`, () => {
        challengeRequests += 1;
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: "Too many attempts. Please try again later.",
          },
          { status: 429, headers: { "Retry-After": "120" } },
        );
      }),
    );

    renderAdminRoute();

    expect(
      await screen.findByText(/too many attempts\. try again in 2 min\./i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send code/i })).toBeDisabled();
    expect(challengeRequests).toBe(1);
  });

  it("signs out from the challenge screen", async () => {
    renderAdminRoute();
    await waitForChallenge();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /sign out/i }));

    await waitFor(() => expect(logoutRequests).toBe(1));
    expect(await screen.findByText("Admin login")).toBeInTheDocument();
  });

  it("does not show 2FA to non-admin users", async () => {
    currentUser = makeUser("USER");

    renderAdminRoute();

    expect(await screen.findByText(/access denied/i)).toBeInTheDocument();
    expect(screen.queryByText(/admin verification/i)).not.toBeInTheDocument();
    expect(challengeRequests).toBe(0);
  });
});
