import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { AuthProvider } from "@/contexts/AuthContext";
import { API_CONSTANTS } from "@/lib/constants";
import { apiService } from "@/services/api";
import { LoginDialog } from "./LoginDialog";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const API_BASE_URL = "http://localhost/api";

const mockUser = {
  id: 42,
  name: "Email",
  surname: "Code",
  email: "otp@example.com",
  role: "USER",
  hobbies: [],
  languages: [],
  visitedCountries: [],
  lastSignInMethod: "email_otp",
};

type CapturedOtpRequest = {
  endpoint: "request" | "resend" | "verify";
  body: Record<string, unknown>;
};

const capturedOtpRequests: CapturedOtpRequest[] = [];
let signedIn = false;

const server = setupServer(
  http.get(`${API_BASE_URL}/auth/me`, () =>
    HttpResponse.json({
      success: true,
      data: signedIn ? mockUser : null,
      error: null,
    }),
  ),
  http.get(`${API_BASE_URL}/auth/identities`, () =>
    HttpResponse.json({
      success: true,
      data: [
        {
          provider: "email_otp",
          label: "Email code",
          linkedAt: "2026-05-21T10:00:00Z",
        },
      ],
      error: null,
    }),
  ),
  http.post(`${API_BASE_URL}/auth/otp/request`, async ({ request }) => {
    capturedOtpRequests.push({
      endpoint: "request",
      body: (await request.json()) as Record<string, unknown>,
    });

    return HttpResponse.json({
      success: true,
      data: {
        message:
          "If this email can receive messages, a verification code has been sent.",
      },
      error: null,
    });
  }),
  http.post(`${API_BASE_URL}/auth/otp/resend`, async ({ request }) => {
    capturedOtpRequests.push({
      endpoint: "resend",
      body: (await request.json()) as Record<string, unknown>,
    });

    return HttpResponse.json({
      success: true,
      data: {
        message:
          "If this email can receive messages, a verification code has been sent.",
      },
      error: null,
    });
  }),
  http.post(`${API_BASE_URL}/auth/otp/verify`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    capturedOtpRequests.push({ endpoint: "verify", body });

    if (body.code !== "123456") {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: "Invalid or expired verification code.",
        },
        { status: 400 },
      );
    }

    signedIn = true;
    return HttpResponse.json({
      success: true,
      data: {
        success: true,
        user: mockUser,
        token: "otp-token",
        csrfToken: "csrf-token",
      },
      error: null,
    });
  }),
);

function renderLoginDialog(onOpenChange = vi.fn()) {
  render(
    <AuthProvider>
      <LoginDialog open onOpenChange={onOpenChange} />
    </AuthProvider>,
  );

  return { onOpenChange };
}

async function requestCode(email = "otp@example.com") {
  const user = userEvent.setup();
  await user.click(
    screen.getByRole("button", { name: /email me a sign-in code/i }),
  );
  await user.type(screen.getByLabelText(/^email$/i), email);
  await user.click(screen.getByRole("button", { name: /email me a code/i }));
  await screen.findByText(/code expires in 10 minutes/i);
  return user;
}

function captured(endpoint: CapturedOtpRequest["endpoint"]) {
  return capturedOtpRequests.filter((item) => item.endpoint === endpoint);
}

describe("LoginDialog email OTP flow", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

  beforeEach(() => {
    apiService.baseURL = API_BASE_URL;
    signedIn = false;
    capturedOtpRequests.length = 0;
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    server.resetHandlers();
    apiService.baseURL = "/api";
    localStorage.clear();
  });

  afterAll(() => server.close());

  it("requests and verifies an email code, then refreshes the session", async () => {
    const { onOpenChange } = renderLoginDialog();
    const user = await requestCode();

    expect(captured("request")[0]?.body).toMatchObject({
      email: "otp@example.com",
      purpose: "REGISTER",
    });

    await user.click(screen.getByLabelText("Digit 1 of 6"));
    await user.paste("123456");
    await user.click(screen.getByRole("button", { name: /verify code/i }));

    await waitFor(() => {
      expect(captured("verify")[0]?.body).toMatchObject({
        email: "otp@example.com",
        purpose: "REGISTER",
        code: "123456",
      });
    });
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(localStorage.getItem(API_CONSTANTS.AUTH_TOKEN_KEY)).toBe(
      "otp-token",
    );
    expect(localStorage.getItem(API_CONSTANTS.USER_KEY)).toContain(
      "otp@example.com",
    );
  });

  it("shows a generic wrong-code error while keeping resend recoverable", async () => {
    renderLoginDialog();
    const user = await requestCode();

    await user.click(screen.getByLabelText("Digit 1 of 6"));
    await user.paste("000000");
    await user.click(screen.getByRole("button", { name: /verify code/i }));

    expect(
      await screen.findByText(
        /that code did not work\. check the 6 digits or request a new code\./i,
      ),
    ).toBeInTheDocument();
    expect(captured("verify")[0]?.body).toMatchObject({
      email: "otp@example.com",
      purpose: "REGISTER",
      code: "000000",
    });
    expect(
      screen.getByRole("button", { name: /resend in|resend code/i }),
    ).toBeInTheDocument();
  });

  it("sends REGISTER when resending a code", async () => {
    const result = await apiService.resendEmailOtp(
      "otp@example.com",
      "REGISTER",
    );

    expect(result.success).toBe(true);
    expect(captured("resend")[0]?.body).toMatchObject({
      email: "otp@example.com",
      purpose: "REGISTER",
    });
  });
});
