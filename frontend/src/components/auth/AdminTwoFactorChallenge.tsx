import * as React from "react";
import {
  LifeBuoy,
  LogOut,
  MailCheck,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import { OtpCodeInput } from "./OtpCodeInput";
import { RetryAfterNotice } from "./RetryAfterNotice";
import { emptyOtpDigits, OTP_CODE_LENGTH } from "./otpCode";

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 90 * 1000;
const AUTO_CHALLENGE_DEDUPE_MS = 5000;
const retryError =
  "Too many attempts. Please wait a little before trying again.";
const genericError =
  "We could not complete admin verification. Please try again.";
const invalidCodeError =
  "That code did not work. Check the 6 digits or request a new code.";
const ADMIN_LOGIN_PATH = "/admin";

const recentAutoChallengeRequests = new Map<string, number>();

type AdminTwoFactorStatus =
  | "idle"
  | "requesting"
  | "code_sent"
  | "verifying"
  | "success"
  | "error";

interface AdminTwoFactorState {
  status: AdminTwoFactorStatus;
  codeDigits: string[];
  message: string;
  error: string;
  expiresAt: number | null;
  resendAvailableAt: number | null;
  requestRetryUntil: number | null;
  verifyLockoutUntil: number | null;
  now: number;
}

type AdminTwoFactorAction =
  | { type: "set_code_digits"; codeDigits: string[] }
  | { type: "challenge_pending"; now: number }
  | { type: "challenge_success"; message: string; now: number }
  | {
      type: "challenge_failure";
      error: string;
      retryUntil?: number;
      now: number;
    }
  | { type: "verify_pending"; now: number }
  | { type: "verify_success"; now: number }
  | { type: "verify_failure"; error: string; retryUntil?: number; now: number }
  | { type: "tick"; now: number };

function createInitialState(): AdminTwoFactorState {
  return {
    status: "idle",
    codeDigits: emptyOtpDigits(),
    message: "",
    error: "",
    expiresAt: null,
    resendAvailableAt: null,
    requestRetryUntil: null,
    verifyLockoutUntil: null,
    now: Date.now(),
  };
}

function reducer(
  state: AdminTwoFactorState,
  action: AdminTwoFactorAction,
): AdminTwoFactorState {
  switch (action.type) {
    case "set_code_digits": {
      const lockoutActive =
        state.verifyLockoutUntil !== null &&
        state.verifyLockoutUntil > state.now;
      const requestRetryActive =
        state.requestRetryUntil !== null && state.requestRetryUntil > state.now;

      return {
        ...state,
        codeDigits: action.codeDigits,
        error: lockoutActive || requestRetryActive ? state.error : "",
      };
    }
    case "challenge_pending":
      return {
        ...state,
        status: "requesting",
        error: "",
        now: action.now,
      };
    case "challenge_success":
      return {
        ...state,
        status: "code_sent",
        codeDigits: emptyOtpDigits(),
        message: action.message || "Verification code sent to your email.",
        error: "",
        expiresAt: action.now + OTP_EXPIRY_MS,
        resendAvailableAt: action.now + RESEND_COOLDOWN_MS,
        requestRetryUntil: null,
        verifyLockoutUntil: null,
        now: action.now,
      };
    case "challenge_failure":
      return {
        ...state,
        status: "error",
        error: action.error,
        requestRetryUntil: action.retryUntil ?? null,
        now: action.now,
      };
    case "verify_pending":
      return {
        ...state,
        status: "verifying",
        error: "",
        now: action.now,
      };
    case "verify_success":
      return {
        ...state,
        status: "success",
        error: "",
        now: action.now,
      };
    case "verify_failure":
      return {
        ...state,
        status: "error",
        error: action.error,
        verifyLockoutUntil: action.retryUntil ?? null,
        now: action.now,
      };
    case "tick": {
      const requestRetryUntil =
        state.requestRetryUntil && state.requestRetryUntil > action.now
          ? state.requestRetryUntil
          : null;
      const verifyLockoutUntil =
        state.verifyLockoutUntil && state.verifyLockoutUntil > action.now
          ? state.verifyLockoutUntil
          : null;
      const clearRetryError =
        state.error === retryError && !requestRetryUntil && !verifyLockoutUntil;

      return {
        ...state,
        error: clearRetryError ? "" : state.error,
        requestRetryUntil,
        verifyLockoutUntil,
        now: action.now,
      };
    }
    default:
      return state;
  }
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) return `${seconds}s`;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function shouldSkipRecentAutoChallenge(key: string, now: number) {
  const lastStartedAt = recentAutoChallengeRequests.get(key);
  if (!lastStartedAt || now - lastStartedAt > AUTO_CHALLENGE_DEDUPE_MS) {
    recentAutoChallengeRequests.set(key, now);
    return false;
  }
  return true;
}

export function AdminTwoFactorChallenge() {
  const { user, logout, refreshSession, setAdminTwoFactorVerified } = useAuth();
  const navigate = useNavigate();
  const descriptionId = React.useId();
  const codeHelpId = React.useId();
  const statusId = React.useId();
  const autoChallengeStartedRef = React.useRef(false);
  const [state, dispatch] = React.useReducer(
    reducer,
    undefined,
    createInitialState,
  );

  const code = state.codeDigits.join("");
  const isCodeValid = new RegExp(`^\\d{${OTP_CODE_LENGTH}}$`).test(code);
  const expiresInSeconds = state.expiresAt
    ? Math.max(0, Math.ceil((state.expiresAt - state.now) / 1000))
    : null;
  const resendInSeconds = state.resendAvailableAt
    ? Math.max(0, Math.ceil((state.resendAvailableAt - state.now) / 1000))
    : 0;
  const requestRetryInSeconds = state.requestRetryUntil
    ? Math.max(0, Math.ceil((state.requestRetryUntil - state.now) / 1000))
    : 0;
  const verifyLockoutInSeconds = state.verifyLockoutUntil
    ? Math.max(0, Math.ceil((state.verifyLockoutUntil - state.now) / 1000))
    : 0;
  const hasCodeChallenge = state.expiresAt !== null;
  const isExpired = expiresInSeconds === 0;
  const isRequesting = state.status === "requesting";
  const isVerifying = state.status === "verifying";
  const isRequestRetryActive = requestRetryInSeconds > 0;
  const isVerifyLockoutActive = verifyLockoutInSeconds > 0;
  const canSendChallenge =
    !isRequesting && !isVerifying && !isRequestRetryActive;
  const canSubmitCode =
    hasCodeChallenge &&
    !isExpired &&
    !isVerifyLockoutActive &&
    !isRequesting &&
    !isVerifying &&
    isCodeValid;
  const canResend =
    hasCodeChallenge &&
    resendInSeconds === 0 &&
    !isRequestRetryActive &&
    !isVerifyLockoutActive &&
    !isRequesting &&
    !isVerifying;

  React.useEffect(() => {
    if (
      !state.expiresAt &&
      !state.resendAvailableAt &&
      !state.requestRetryUntil &&
      !state.verifyLockoutUntil
    ) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      dispatch({ type: "tick", now: Date.now() });
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [
    state.expiresAt,
    state.requestRetryUntil,
    state.resendAvailableAt,
    state.verifyLockoutUntil,
  ]);

  const requestChallenge = React.useCallback(async () => {
    if (!canSendChallenge) return;

    dispatch({ type: "challenge_pending", now: Date.now() });
    const result = await apiService.requestAdminTwoFactor();
    const now = Date.now();

    if (result.success) {
      dispatch({
        type: "challenge_success",
        message: result.message || "Verification code sent to your email.",
        now,
      });
      return;
    }

    const retryUntil = result.retryAfterSeconds
      ? now + result.retryAfterSeconds * 1000
      : undefined;
    dispatch({
      type: "challenge_failure",
      error: result.retryAfterSeconds
        ? retryError
        : result.error || genericError,
      retryUntil,
      now,
    });
  }, [canSendChallenge]);

  React.useEffect(() => {
    if (!user || autoChallengeStartedRef.current) return;

    const now = Date.now();
    const key = `${user.id}:${user.role}`;
    if (shouldSkipRecentAutoChallenge(key, now)) return;

    autoChallengeStartedRef.current = true;
    void requestChallenge();
  }, [requestChallenge, user]);

  const verifyCode = async () => {
    if (!canSubmitCode) return;

    dispatch({ type: "verify_pending", now: Date.now() });
    const result = await apiService.verifyAdminTwoFactor(code);
    const now = Date.now();

    if (result.success) {
      dispatch({ type: "verify_success", now });
      setAdminTwoFactorVerified(true);
      await refreshSession();
      return;
    }

    const retryUntil = result.retryAfterSeconds
      ? now + result.retryAfterSeconds * 1000
      : undefined;
    dispatch({
      type: "verify_failure",
      error: result.retryAfterSeconds
        ? retryError
        : result.error || invalidCodeError,
      retryUntil,
      now,
    });
  };

  const handleSignOut = () => {
    setAdminTwoFactorVerified(false);
    logout();
    navigate(ADMIN_LOGIN_PATH, { replace: true });
  };

  const statusMessage = React.useMemo(() => {
    if (isRequestRetryActive || isVerifyLockoutActive) return "";
    if (state.error) return state.error;
    if (state.status === "success") return "Admin verification complete.";
    if (isRequesting) return "Sending your admin verification code...";
    if (!hasCodeChallenge) return "";
    if (isExpired) return "Code expired. Request a new code to continue.";
    return "Check your email. Code expires in 10 minutes.";
  }, [
    hasCodeChallenge,
    isExpired,
    isRequestRetryActive,
    isRequesting,
    isVerifyLockoutActive,
    state.error,
    state.status,
  ]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <section
        aria-labelledby="admin-2fa-title"
        className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1
            id="admin-2fa-title"
            className="text-2xl font-semibold text-foreground"
          >
            Admin verification
          </h1>
          <p id={descriptionId} className="mt-2 text-sm text-muted-foreground">
            Complete email-code verification before opening the admin panel.
          </p>
        </div>

        <form
          aria-describedby={descriptionId}
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void verifyCode();
          }}
        >
          {hasCodeChallenge && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                <MailCheck className="h-4 w-4 text-primary" />
                <span>
                  {state.message || "Verification code sent to your email."}
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Enter code
                </label>
                <OtpCodeInput
                  value={state.codeDigits}
                  onChange={(codeDigits) =>
                    dispatch({ type: "set_code_digits", codeDigits })
                  }
                  disabled={isVerifying || isVerifyLockoutActive}
                  ariaDescribedBy={`${codeHelpId} ${statusId}`}
                />
                <p id={codeHelpId} className="text-xs text-muted-foreground">
                  Paste the full code or type one digit per box.
                </p>
              </div>
            </div>
          )}

          <div
            id={statusId}
            aria-live="polite"
            className="min-h-16 text-center text-sm"
          >
            {statusMessage && (
              <p
                className={
                  state.error || isExpired
                    ? "text-destructive"
                    : "text-muted-foreground"
                }
              >
                {statusMessage}
              </p>
            )}
            {isRequestRetryActive && (
              <RetryAfterNotice
                retryAfterSeconds={requestRetryInSeconds}
                message="Too many attempts."
                variant="cooldown"
              />
            )}
            {isVerifyLockoutActive && (
              <RetryAfterNotice
                retryAfterSeconds={verifyLockoutInSeconds}
                message="Too many attempts."
                variant="lockout"
              />
            )}
            {hasCodeChallenge &&
              !isExpired &&
              !isRequestRetryActive &&
              !isVerifyLockoutActive && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {resendInSeconds > 0
                    ? `You can request another code in ${formatCountdown(resendInSeconds)}.`
                    : "You can request another code now."}
                </p>
              )}
          </div>

          {hasCodeChallenge ? (
            <>
              <Button
                type="submit"
                className="w-full"
                disabled={!canSubmitCode}
              >
                {isVerifying ? "Verifying..." : "Verify admin access"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={!canResend}
                onClick={() => void requestChallenge()}
              >
                <RefreshCw className="h-4 w-4" />
                {resendInSeconds > 0
                  ? `Resend in ${formatCountdown(resendInSeconds)}`
                  : "Resend code"}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              className="w-full"
              disabled={!canSendChallenge}
              onClick={() => void requestChallenge()}
            >
              {isRequesting ? "Sending code..." : "Send code"}
            </Button>
          )}
        </form>

        <div className="mt-5 space-y-3 border-t pt-4">
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <LifeBuoy className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Lost access? Contact a head admin or UniVoyage support to recover
              admin access.
            </span>
          </p>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </section>
    </main>
  );
}
