import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MailCheck,
  ShieldCheck,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { AuthEmailRequestForm } from "@/components/auth/AuthEmailRequestForm";
import { AuthStatusLayout } from "@/components/auth/AuthStatusLayout";
import { RetryAfterNotice } from "@/components/auth/RetryAfterNotice";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { apiService } from "@/services/api";

type VerificationPhase =
  | "request"
  | "check_email"
  | "loading"
  | "success"
  | "error"
  | "rate_limited";

const verificationRequestDescription =
  "If the address can receive verification instructions, we will send a link.";
const verificationRequestFallback =
  "We could not request email verification. Please try again.";
const verificationInvalidLinkCopy =
  "This verification link did not work. Request a new verification email.";

function tokenFromSearch(search: string) {
  return new URLSearchParams(search).get("token")?.trim() || "";
}

export default function EmailVerificationPage() {
  const location = useLocation();
  const token = React.useMemo(
    () => tokenFromSearch(location.search),
    [location.search],
  );
  const confirmedTokenRef = React.useRef("");
  const [phase, setPhase] = React.useState<VerificationPhase>(
    token ? "loading" : "request",
  );
  const [acceptedMessage, setAcceptedMessage] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState(
    verificationInvalidLinkCopy,
  );
  const [retryAfterSeconds, setRetryAfterSeconds] = React.useState<
    number | undefined
  >();

  useDocumentTitle(
    phase === "check_email" ? "Check your email" : "Verify email",
    [phase],
  );

  const confirmToken = React.useCallback(
    async (tokenToConfirm: string, force = false) => {
      if (!tokenToConfirm) {
        setPhase("request");
        return;
      }
      if (!force && confirmedTokenRef.current === tokenToConfirm) return;

      confirmedTokenRef.current = tokenToConfirm;
      setPhase("loading");
      setRetryAfterSeconds(undefined);
      setErrorMessage("");
      const result = await apiService.confirmEmailVerification(tokenToConfirm);

      if (result.success) {
        setPhase("success");
        return;
      }

      setErrorMessage(result.error || verificationInvalidLinkCopy);
      if (result.retryAfterSeconds) {
        setRetryAfterSeconds(result.retryAfterSeconds);
        setPhase("rate_limited");
        return;
      }

      setPhase("error");
    },
    [],
  );

  React.useEffect(() => {
    if (!token) {
      confirmedTokenRef.current = "";
      setPhase("request");
      setRetryAfterSeconds(undefined);
      setErrorMessage(verificationInvalidLinkCopy);
      return;
    }

    void confirmToken(token);
  }, [confirmToken, token]);

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

  if (phase === "loading") {
    return (
      <AuthStatusLayout
        title="Verify email"
        description="Please wait while we verify your email link."
        icon={<ShieldCheck className="h-8 w-8 text-primary" aria-hidden />}
        footer={
          <Loader2
            className="h-8 w-8 animate-spin text-primary"
            aria-label="Loading"
          />
        }
      />
    );
  }

  if (phase === "success") {
    return (
      <AuthStatusLayout
        title="Email verified"
        description="Your email has been verified. You can continue using UniVoyage."
        icon={<CheckCircle2 className="h-8 w-8 text-primary" aria-hidden />}
        footer={
          <Button asChild>
            <Link to="/?login=1">Sign in</Link>
          </Button>
        }
      />
    );
  }

  if (phase === "rate_limited") {
    return (
      <AuthStatusLayout
        title="Verify email"
        description="We could not verify this link right now."
        icon={<AlertCircle className="h-8 w-8 text-destructive" aria-hidden />}
      >
        <RetryAfterNotice
          retryAfterSeconds={retryAfterSeconds}
          message="Too many attempts."
          variant="lockout"
          onElapsed={() => setRetryAfterSeconds(undefined)}
        />
        <Button
          type="button"
          className="w-full"
          disabled={Boolean(retryAfterSeconds)}
          onClick={() => void confirmToken(token, true)}
        >
          Try again
        </Button>
      </AuthStatusLayout>
    );
  }

  if (phase === "error") {
    return (
      <AuthStatusLayout
        title="Verification link did not work"
        description={errorMessage || verificationInvalidLinkCopy}
        icon={<AlertCircle className="h-8 w-8 text-destructive" aria-hidden />}
      >
        <AuthEmailRequestForm
          buttonLabel="Send verification email"
          defaultError={verificationRequestFallback}
          description={verificationRequestDescription}
          requestEmail={(email) => apiService.requestEmailVerification(email)}
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
      title="Verify email"
      description="Enter your email and we will send verification instructions."
      icon={<ShieldCheck className="h-8 w-8 text-primary" aria-hidden />}
    >
      <AuthEmailRequestForm
        buttonLabel="Send verification email"
        defaultError={verificationRequestFallback}
        description={verificationRequestDescription}
        requestEmail={(email) => apiService.requestEmailVerification(email)}
        onAccepted={(message) => {
          setAcceptedMessage(message);
          setPhase("check_email");
        }}
      />
    </AuthStatusLayout>
  );
}
