import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AlertCircle, Loader2, LogIn } from "lucide-react";
import { useAuth } from "@/contexts";
import { AuthStatusLayout } from "@/components/auth/AuthStatusLayout";
import { ROUTE_PATHS } from "@/config/routes";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { consumeOAuthReturnUrl } from "@/lib/auth/session";
import {
  handleOAuthCallback,
  isOAuthProvider,
  OAUTH_PROVIDER_CONFIG,
  postOAuthError,
  postOAuthSuccess,
} from "@/lib/oauth";

type CallbackPhase = "loading" | "error";

export default function OAuthCallbackPage() {
  const { provider: providerParam } = useParams<{ provider: string }>();
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  const ran = useRef(false);
  const isPopup = window.opener !== null;
  const [phase, setPhase] = useState<CallbackPhase>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const provider =
    providerParam && isOAuthProvider(providerParam) ? providerParam : null;

  const label = provider ? OAUTH_PROVIDER_CONFIG[provider].label : "Sign-in";

  useDocumentTitle(
    phase === "error"
      ? "Sign-in failed"
      : provider
        ? `Signing in with ${label}…`
        : "Signing in…",
  );

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!provider) {
      const msg = "Unknown sign-in provider";
      if (isPopup) {
        window.close();
      } else {
        setErrorMessage(msg);
        setPhase("error");
        toast.error(msg);
      }
      return;
    }

    const finishError = (message: string) => {
      if (isPopup) {
        postOAuthError(
          window.opener,
          provider,
          message,
          window.location.origin,
        );
        window.close();
      } else {
        setErrorMessage(message);
        setPhase("error");
        toast.error(message);
      }
    };

    const finishSuccess = async () => {
      await refreshSession();
      const redirectUrl = consumeOAuthReturnUrl();
      if (isPopup) {
        postOAuthSuccess(window.opener, provider, window.location.origin);
        window.close();
      } else {
        toast.success(`Signed in with ${label}!`);
        navigate(redirectUrl);
      }
    };

    (async () => {
      const result = await handleOAuthCallback(
        provider,
        window.location.search,
      );

      if (!result.success) {
        finishError(result.error);
        return;
      }

      try {
        await finishSuccess();
      } catch (e) {
        finishError(e instanceof Error ? e.message : `${label} sign-in failed`);
      }
    })();
  }, [navigate, refreshSession, isPopup, provider, label]);

  if (phase === "error" && errorMessage) {
    return (
      <AuthStatusLayout
        title="Sign-in didn't complete"
        description={errorMessage}
        icon={<AlertCircle className="h-8 w-8 text-destructive" aria-hidden />}
        footer={
          <button
            type="button"
            onClick={() => navigate(ROUTE_PATHS.HOME)}
            className="text-sm font-medium text-primary hover:underline"
          >
            Return to home
          </button>
        }
      />
    );
  }

  return (
    <AuthStatusLayout
      title={provider ? `Signing in with ${label}` : "Signing you in"}
      description="Please wait while we complete your authentication…"
      icon={<LogIn className="h-8 w-8 text-primary" aria-hidden />}
      footer={
        <Loader2
          className="h-8 w-8 text-primary animate-spin"
          aria-label="Loading"
        />
      }
    />
  );
}
