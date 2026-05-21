import * as React from "react";
import { Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { VALIDATION } from "@/lib/constants";
import { apiService } from "@/services/api";
import type { EmailOtpPurpose } from "@/types/auth";
import { OtpCodeInput } from "./OtpCodeInput";
import { emptyOtpDigits, OTP_CODE_LENGTH } from "./otpCode";

const EMAIL_OTP_PURPOSE: EmailOtpPurpose = "REGISTER";
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 90 * 1000;

type OtpStatus = "idle" | "code_sent" | "verifying" | "success" | "error";

interface OtpState {
  status: OtpStatus;
  email: string;
  codeDigits: string[];
  message: string;
  error: string;
  expiresAt: number | null;
  resendAvailableAt: number | null;
  now: number;
  isRequesting: boolean;
}

type OtpAction =
  | { type: "set_email"; email: string }
  | { type: "set_code_digits"; codeDigits: string[] }
  | { type: "request_pending"; now: number }
  | { type: "request_success"; email: string; message: string; now: number }
  | { type: "request_failure"; error: string; now: number }
  | { type: "verify_pending"; now: number }
  | { type: "verify_success"; now: number }
  | { type: "verify_failure"; error: string; now: number }
  | { type: "tick"; now: number }
  | { type: "edit_email" }
  | { type: "reset"; email?: string };

const defaultOtpMessage =
  "If this email can receive messages, a verification code has been sent.";
const genericOtpError =
  "We could not send or verify your code. Please try again.";

function createInitialState(email = ""): OtpState {
  return {
    status: "idle",
    email,
    codeDigits: emptyOtpDigits(),
    message: "",
    error: "",
    expiresAt: null,
    resendAvailableAt: null,
    now: Date.now(),
    isRequesting: false,
  };
}

function otpReducer(state: OtpState, action: OtpAction): OtpState {
  switch (action.type) {
    case "set_email":
      return { ...state, email: action.email, error: "" };
    case "set_code_digits":
      return { ...state, codeDigits: action.codeDigits, error: "" };
    case "request_pending":
      return { ...state, isRequesting: true, error: "", now: action.now };
    case "request_success":
      return {
        ...state,
        status: "code_sent",
        email: action.email,
        codeDigits: emptyOtpDigits(),
        message: action.message || defaultOtpMessage,
        error: "",
        expiresAt: action.now + OTP_EXPIRY_MS,
        resendAvailableAt: action.now + RESEND_COOLDOWN_MS,
        now: action.now,
        isRequesting: false,
      };
    case "request_failure":
      return {
        ...state,
        status: "error",
        error: action.error,
        now: action.now,
        isRequesting: false,
      };
    case "verify_pending":
      return { ...state, status: "verifying", error: "", now: action.now };
    case "verify_success":
      return { ...state, status: "success", error: "", now: action.now };
    case "verify_failure":
      return {
        ...state,
        status: "error",
        error: action.error,
        now: action.now,
      };
    case "tick":
      return { ...state, now: action.now };
    case "edit_email":
      return createInitialState(state.email);
    case "reset":
      return createInitialState(action.email ?? "");
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

interface EmailOtpSignInFormProps {
  initialEmail?: string;
  onEmailChange?: (email: string) => void;
  onSuccess: () => void;
  onPasswordModeClick: () => void;
  onSignUpClick?: () => void;
}

export function EmailOtpSignInForm({
  initialEmail = "",
  onEmailChange,
  onSuccess,
  onPasswordModeClick,
  onSignUpClick,
}: EmailOtpSignInFormProps) {
  const { emailOtpSignIn } = useAuth();
  const descriptionId = React.useId();
  const statusId = React.useId();
  const codeHelpId = React.useId();
  const [state, dispatch] = React.useReducer(
    otpReducer,
    initialEmail,
    createInitialState,
  );

  React.useEffect(() => {
    if (!state.expiresAt && !state.resendAvailableAt) return;
    const intervalId = window.setInterval(() => {
      dispatch({ type: "tick", now: Date.now() });
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [state.expiresAt, state.resendAvailableAt]);

  const trimmedEmail = state.email.trim();
  const isEmailValid = VALIDATION.EMAIL_REGEX.test(trimmedEmail);
  const code = state.codeDigits.join("");
  const isCodeValid = new RegExp(`^\\d{${OTP_CODE_LENGTH}}$`).test(code);
  const expiresInSeconds = state.expiresAt
    ? Math.max(0, Math.ceil((state.expiresAt - state.now) / 1000))
    : null;
  const resendInSeconds = state.resendAvailableAt
    ? Math.max(0, Math.ceil((state.resendAvailableAt - state.now) / 1000))
    : 0;
  const isExpired = expiresInSeconds === 0;
  const isVerifying = state.status === "verifying";
  const hasCodeChallenge = state.expiresAt !== null;
  const canSubmitCode =
    hasCodeChallenge &&
    !isExpired &&
    isCodeValid &&
    !isVerifying &&
    !state.isRequesting;
  const canResend =
    hasCodeChallenge &&
    resendInSeconds === 0 &&
    !isVerifying &&
    !state.isRequesting;
  const codeEntryVisible = hasCodeChallenge;

  const requestCode = async (isResend = false) => {
    if (!isEmailValid || state.isRequesting) return;

    const now = Date.now();
    dispatch({ type: "request_pending", now });
    const result = isResend
      ? await apiService.resendEmailOtp(trimmedEmail, EMAIL_OTP_PURPOSE)
      : await apiService.requestEmailOtp(trimmedEmail, EMAIL_OTP_PURPOSE);

    if (result.success) {
      dispatch({
        type: "request_success",
        email: trimmedEmail,
        message: result.message || defaultOtpMessage,
        now: Date.now(),
      });
      return;
    }

    const error = result.error || genericOtpError;
    dispatch({ type: "request_failure", error, now: Date.now() });
    toast.error(error);
  };

  const verifyCode = async () => {
    if (!canSubmitCode) return;

    dispatch({ type: "verify_pending", now: Date.now() });
    const result = await emailOtpSignIn(trimmedEmail, code, EMAIL_OTP_PURPOSE);
    if (result.success) {
      dispatch({ type: "verify_success", now: Date.now() });
      toast.success("Welcome! You've been signed in with your email code.");
      onSuccess();
      return;
    }

    const error = result.error || genericOtpError;
    dispatch({ type: "verify_failure", error, now: Date.now() });
    toast.error(error);
  };

  const statusMessage = React.useMemo(() => {
    if (state.error) return state.error;
    if (state.status === "success") return "Email code verified.";
    if (!codeEntryVisible) return "";
    if (isExpired) return "Code expired. Request a new code to continue.";
    return "Code expires in 10 minutes.";
  }, [codeEntryVisible, isExpired, state.error, state.status]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (codeEntryVisible) {
          void verifyCode();
        } else {
          void requestCode(false);
        }
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <label
          htmlFor="email-otp-email"
          className="text-sm font-medium text-foreground"
        >
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email-otp-email"
            type="email"
            placeholder="Enter your email"
            value={state.email}
            onChange={(event) => {
              dispatch({ type: "set_email", email: event.target.value });
              onEmailChange?.(event.target.value);
            }}
            className="pl-10"
            aria-describedby={descriptionId}
            disabled={codeEntryVisible || state.isRequesting || isVerifying}
            required
          />
        </div>
        <p id={descriptionId} className="text-xs text-muted-foreground">
          We will send a 6-digit code to this address.
        </p>
      </div>

      {codeEntryVisible && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Code sent to {trimmedEmail}</span>
            </div>
            <button
              type="button"
              className="shrink-0 text-sm font-medium text-primary hover:underline"
              onClick={() => dispatch({ type: "edit_email" })}
              disabled={isVerifying}
            >
              Change
            </button>
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
              disabled={isVerifying}
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
        className="min-h-14 text-center text-sm"
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
        {codeEntryVisible && !isExpired && (
          <p className="mt-1 text-xs text-muted-foreground">
            {resendInSeconds > 0
              ? `You can request another code in ${formatCountdown(resendInSeconds)}.`
              : `You can request another code now.`}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={
          codeEntryVisible
            ? !canSubmitCode
            : !isEmailValid || state.isRequesting
        }
      >
        {codeEntryVisible
          ? isVerifying
            ? "Verifying..."
            : "Verify Code"
          : state.isRequesting
            ? "Sending Code..."
            : "Email Me a Code"}
      </Button>

      {codeEntryVisible && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => void requestCode(true)}
          disabled={!canResend}
        >
          {resendInSeconds > 0
            ? `Resend in ${formatCountdown(resendInSeconds)}`
            : "Resend code"}
        </Button>
      )}

      <div className="text-center text-sm">
        <button
          type="button"
          className="font-medium text-primary hover:underline"
          onClick={() => {
            dispatch({ type: "reset", email: state.email });
            onPasswordModeClick();
          }}
        >
          Use password instead
        </button>
      </div>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">
          Want the full sign-up form?{" "}
        </span>
        <button
          type="button"
          className="font-medium text-primary hover:underline"
          onClick={onSignUpClick}
        >
          Create account
        </button>
      </div>
    </form>
  );
}
