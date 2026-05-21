import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { apiService } from "@/services/api";
import PasswordResetPage from "./PasswordResetPage";
import EmailVerificationPage from "./EmailVerificationPage";

const API_BASE_URL = "http://localhost/api";

let resetRequests: Array<Record<string, unknown>> = [];
let forgotRequests: Array<Record<string, unknown>> = [];
let verificationRequests: Array<Record<string, unknown>> = [];
let verificationConfirms: Array<Record<string, unknown>> = [];

const server = setupServer(
  http.post(`${API_BASE_URL}/auth/password/forgot`, async ({ request }) => {
    forgotRequests.push((await request.json()) as Record<string, unknown>);
    return HttpResponse.json({
      success: true,
      data: {
        message:
          "If an account exists for this email, password reset instructions have been sent.",
      },
      error: null,
    });
  }),
  http.post(`${API_BASE_URL}/auth/password/reset`, async ({ request }) => {
    resetRequests.push((await request.json()) as Record<string, unknown>);
    return HttpResponse.json({
      success: true,
      data: null,
      error: null,
    });
  }),
  http.post(
    `${API_BASE_URL}/auth/email/verification/request`,
    async ({ request }) => {
      verificationRequests.push(
        (await request.json()) as Record<string, unknown>,
      );
      return HttpResponse.json({
        success: true,
        data: {
          message:
            "If an account exists for this email, verification instructions have been sent.",
        },
        error: null,
      });
    },
  ),
  http.post(
    `${API_BASE_URL}/auth/email/verification/confirm`,
    async ({ request }) => {
      verificationConfirms.push(
        (await request.json()) as Record<string, unknown>,
      );
      await new Promise((resolve) => setTimeout(resolve, 20));
      return HttpResponse.json({
        success: true,
        data: null,
        error: null,
      });
    },
  ),
);

function renderEmailRoutes(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/auth/reset-password" element={<PasswordResetPage />} />
        <Route path="/auth/reset" element={<PasswordResetPage />} />
        <Route path="/auth/verify-email" element={<EmailVerificationPage />} />
        <Route path="/auth/verify" element={<EmailVerificationPage />} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("email-driven auth entry pages", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

  beforeEach(() => {
    apiService.baseURL = API_BASE_URL;
    resetRequests = [];
    forgotRequests = [];
    verificationRequests = [];
    verificationConfirms = [];
    document.title = "UniVoyage";
  });

  afterEach(() => {
    server.resetHandlers();
    apiService.baseURL = "/api";
  });

  afterAll(() => server.close());

  it("opens reset deep links, submits a new password, and never puts token in the title", async () => {
    renderEmailRoutes("/auth/reset-password?token=fake-token");
    const user = userEvent.setup();

    expect(
      screen.getByRole("heading", { name: /reset password/i }),
    ).toBeInTheDocument();
    expect(document.title).toBe("Reset password | UniVoyage");
    expect(document.title).not.toContain("fake-token");

    await user.type(screen.getByLabelText(/^new password$/i), "ValidPass1");
    await user.type(screen.getByLabelText(/^confirm password$/i), "ValidPass1");
    await user.click(screen.getByRole("button", { name: /^reset password$/i }));

    expect(
      await screen.findByRole("heading", {
        name: /password reset complete/i,
      }),
    ).toBeInTheDocument();
    expect(resetRequests[0]).toMatchObject({
      token: "fake-token",
      newPassword: "ValidPass1",
    });
    expect(document.title).not.toContain("fake-token");
  });

  it("shows generic reset-link failure copy for invalid or used tokens", async () => {
    server.use(
      http.post(`${API_BASE_URL}/auth/password/reset`, async ({ request }) => {
        resetRequests.push((await request.json()) as Record<string, unknown>);
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error:
              "Invalid or expired reset link. Please request a new password reset.",
          },
          { status: 400 },
        );
      }),
    );

    renderEmailRoutes("/auth/reset?token=fake-token");
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/^new password$/i), "ValidPass1");
    await user.type(screen.getByLabelText(/^confirm password$/i), "ValidPass1");
    await user.click(screen.getByRole("button", { name: /^reset password$/i }));

    expect(
      await screen.findByText(
        /this reset link did not work\. request a new password reset email\./i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send a new reset link/i }),
    ).toBeInTheDocument();
  });

  it("requests a forgot-password email and shows a stable check-email step", async () => {
    renderEmailRoutes("/auth/reset-password");
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/^email$/i), "reset@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(
      await screen.findByRole("heading", { name: /check your email/i }),
    ).toBeInTheDocument();
    expect(forgotRequests[0]).toMatchObject({ email: "reset@example.com" });
    expect(resetRequests).toHaveLength(0);
    expect(document.title).toBe("Check your email | UniVoyage");
  });

  it("confirms email verification deep links after a loading state", async () => {
    renderEmailRoutes("/auth/verify-email?token=fake-token");

    expect(
      screen.getByText(/please wait while we verify your email link/i),
    ).toBeInTheDocument();
    expect(document.title).toBe("Verify email | UniVoyage");
    expect(document.title).not.toContain("fake-token");

    expect(
      await screen.findByRole("heading", { name: /email verified/i }),
    ).toBeInTheDocument();
    expect(verificationConfirms[0]).toMatchObject({ token: "fake-token" });
    expect(document.title).not.toContain("fake-token");
  });

  it("shows generic email verification failure copy for invalid or used tokens", async () => {
    server.use(
      http.post(
        `${API_BASE_URL}/auth/email/verification/confirm`,
        async ({ request }) => {
          verificationConfirms.push(
            (await request.json()) as Record<string, unknown>,
          );
          return HttpResponse.json(
            {
              success: false,
              data: null,
              error:
                "Invalid or expired verification link. Please request a new verification email.",
            },
            { status: 400 },
          );
        },
      ),
    );

    renderEmailRoutes("/auth/verify?token=fake-token");

    expect(
      await screen.findByText(
        /this verification link did not work\. request a new verification email\./i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send verification email/i }),
    ).toBeInTheDocument();
  });

  it("does not confirm verification when no token is present", () => {
    renderEmailRoutes("/auth/verify-email");

    expect(
      screen.getByRole("button", { name: /send verification email/i }),
    ).toBeInTheDocument();
    expect(verificationConfirms).toHaveLength(0);
  });

  it("requests an email verification link and shows check-email copy", async () => {
    renderEmailRoutes("/auth/verify-email");
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/^email$/i), "verify@example.com");
    await user.click(
      screen.getByRole("button", { name: /send verification email/i }),
    );

    expect(
      await screen.findByRole("heading", { name: /check your email/i }),
    ).toBeInTheDocument();
    expect(verificationRequests[0]).toMatchObject({
      email: "verify@example.com",
    });
  });

  it("shows Retry-After countdowns for request, reset, and confirm 429s", async () => {
    server.use(
      http.post(`${API_BASE_URL}/auth/password/forgot`, async ({ request }) => {
        forgotRequests.push((await request.json()) as Record<string, unknown>);
        return HttpResponse.json(
          { success: false, data: null, error: "Too many attempts." },
          { status: 429, headers: { "Retry-After": "120" } },
        );
      }),
      http.post(`${API_BASE_URL}/auth/password/reset`, async ({ request }) => {
        resetRequests.push((await request.json()) as Record<string, unknown>);
        return HttpResponse.json(
          { success: false, data: null, error: "Too many attempts." },
          { status: 429, headers: { "Retry-After": "120" } },
        );
      }),
      http.post(
        `${API_BASE_URL}/auth/email/verification/confirm`,
        async ({ request }) => {
          verificationConfirms.push(
            (await request.json()) as Record<string, unknown>,
          );
          return HttpResponse.json(
            { success: false, data: null, error: "Too many attempts." },
            { status: 429, headers: { "Retry-After": "120" } },
          );
        },
      ),
    );

    const requestView = renderEmailRoutes("/auth/reset-password");
    const requestUser = userEvent.setup();
    await requestUser.type(
      screen.getByLabelText(/^email$/i),
      "reset@example.com",
    );
    await requestUser.click(
      screen.getByRole("button", { name: /send reset link/i }),
    );
    expect(
      await screen.findByText(/too many attempts\. try again in 2 min\./i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send reset link/i }),
    ).toBeDisabled();
    requestView.unmount();

    const resetView = renderEmailRoutes(
      "/auth/reset-password?token=fake-token",
    );
    const resetUser = userEvent.setup();
    await resetUser.type(
      screen.getByLabelText(/^new password$/i),
      "ValidPass1",
    );
    await resetUser.type(
      screen.getByLabelText(/^confirm password$/i),
      "ValidPass1",
    );
    await resetUser.click(
      screen.getByRole("button", { name: /^reset password$/i }),
    );
    expect(
      await screen.findByText(/too many attempts\. try again in 2 min\./i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^reset password$/i }),
    ).toBeDisabled();
    resetView.unmount();

    renderEmailRoutes("/auth/verify-email?token=fake-token");
    expect(
      await screen.findByText(/too many attempts\. try again in 2 min\./i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeDisabled();
  });
});
