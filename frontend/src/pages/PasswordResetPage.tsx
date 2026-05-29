import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  MailCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useConsumeQueryParam } from "@/lib/auth/useConsumeQueryParam";
import { AuthEmailRequestForm } from "@/components/auth/AuthEmailRequestForm";
import { AuthStatusLayout } from "@/components/auth/AuthStatusLayout";
import { RetryAfterNotice } from "@/components/auth/RetryAfterNotice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PasswordStrength,
  getPasswordStrength,
} from "@/components/ui/password-strength";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { apiService } from "@/services/api";

type ResetPhase =
  | "request"
  | "check_email"
  | "form"
  | "submitting"
  | "success"
  | "error";

const resetRequestDescription =
  "If the address can receive reset instructions, we will send a link.";
const resetRequestFallback =
  "We could not request a password reset. Please try again.";
const resetInvalidLinkCopy =
  "This reset link did not work. Request a new password reset email.";

export default function PasswordResetPage() {
  const token = useConsumeQueryParam("token");
  const [phase, setPhase] = React.useState<ResetPhase>(
    token ? "form" : "request",
  );
  const [acceptedMessage, setAcceptedMessage] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [retryAfterSeconds, setRetryAfterSeconds] = React.useState<
    number | undefined
  >();

  React.useEffect(() => {
    setPhase(token ? "form" : "request");
    setAcceptedMessage("");
    setErrorMessage("");
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setRetryAfterSeconds(undefined);
  }, [token]);

  useDocumentTitle(
    phase === "check_email" ? "Check your email" : "Reset password",
    [phase],
  );

  const passwordStrength = React.useMemo(
    () => getPasswordStrength(newPassword),
    [newPassword],
  );
  const passwordsMatch =
    newPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit =
    token &&
    passwordStrength.isStrong &&
    passwordsMatch &&
    !retryAfterSeconds &&
    phase !== "submitting";

  const handleReset = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setPhase("submitting");
    setErrorMessage("");
    setRetryAfterSeconds(undefined);
    const result = await apiService.resetPassword(token, newPassword);

    if (result.success) {
      setPhase("success");
      return;
    }

    if (result.retryAfterSeconds) {
      setPhase("form");
      setErrorMessage(result.error || resetRequestFallback);
      setRetryAfterSeconds(result.retryAfterSeconds);
      return;
    }

    setErrorMessage(result.error || resetInvalidLinkCopy);
    setPhase("error");
  };

  if (phase === "check_email") {
    return (
      <AuthStatusLayout
        title="Check your email"
        description={acceptedMessage}
        icon={<MailCheck className="h-8 w-8 text-primary" aria-hidden />}
        footer={
          <Button asChild variant="outline">
            <Link to="/?login=1">Return to sign in</Link>
          </Button>
        }
      />
    );
  }

  if (phase === "success") {
    return (
      <AuthStatusLayout
        title="Password reset complete"
        description="Your password has been updated. You can sign in with your new password."
        icon={<CheckCircle2 className="h-8 w-8 text-primary" aria-hidden />}
        footer={
          <Button asChild>
            <Link to="/?login=1">Sign in</Link>
          </Button>
        }
      />
    );
  }

  if (phase === "request") {
    return (
      <AuthStatusLayout
        title="Reset password"
        description="Enter your email and we will send password reset instructions."
        icon={<KeyRound className="h-8 w-8 text-primary" aria-hidden />}
      >
        <AuthEmailRequestForm
          buttonLabel="Send reset link"
          defaultError={resetRequestFallback}
          description={resetRequestDescription}
          requestEmail={(email) => apiService.requestPasswordReset(email)}
          onAccepted={(message) => {
            setAcceptedMessage(message);
            setPhase("check_email");
          }}
        />
      </AuthStatusLayout>
    );
  }

  if (phase === "error") {
    return (
      <AuthStatusLayout
        title="Reset link did not work"
        description={errorMessage || resetInvalidLinkCopy}
        icon={<AlertCircle className="h-8 w-8 text-destructive" aria-hidden />}
      >
        <AuthEmailRequestForm
          buttonLabel="Send a new reset link"
          defaultError={resetRequestFallback}
          description={resetRequestDescription}
          requestEmail={(email) => apiService.requestPasswordReset(email)}
          onAccepted={(message) => {
            setAcceptedMessage(message);
            setPhase("check_email");
          }}
        />
      </AuthStatusLayout>
    );
  }

  return (
    <AuthStatusLayout
      title="Reset password"
      description="Choose a new password for your UniVoyage account."
      icon={<KeyRound className="h-8 w-8 text-primary" aria-hidden />}
    >
      <form onSubmit={handleReset} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="new-password" className="text-sm font-medium">
            New password
          </label>
          <div className="relative">
            <Input
              id="new-password"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);
                setErrorMessage("");
                setRetryAfterSeconds(undefined);
              }}
              className="pr-10"
              autoComplete="new-password"
              disabled={phase === "submitting"}
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={
                showNewPassword ? "Hide new password" : "Show new password"
              }
              disabled={phase === "submitting"}
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden />
              ) : (
                <Eye className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
          <PasswordStrength password={newPassword} />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirm-new-password" className="text-sm font-medium">
            Confirm password
          </label>
          <div className="relative">
            <Input
              id="confirm-new-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setErrorMessage("");
                setRetryAfterSeconds(undefined);
              }}
              className="pr-10"
              autoComplete="new-password"
              disabled={phase === "submitting"}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
              disabled={phase === "submitting"}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden />
              ) : (
                <Eye className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
          {confirmPassword && !passwordsMatch && (
            <p className="text-xs text-destructive" role="alert">
              Passwords do not match.
            </p>
          )}
        </div>

        <div aria-live="polite" className="min-h-12 text-sm">
          {retryAfterSeconds ? (
            <RetryAfterNotice
              retryAfterSeconds={retryAfterSeconds}
              message="Too many attempts."
              variant="lockout"
              onElapsed={() => {
                setRetryAfterSeconds(undefined);
                setErrorMessage("");
              }}
            />
          ) : errorMessage ? (
            <p className="text-center text-destructive" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={!canSubmit}>
          {phase === "submitting" ? "Resetting..." : "Reset password"}
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link to="/">Cancel</Link>
        </Button>
      </form>
    </AuthStatusLayout>
  );
}
