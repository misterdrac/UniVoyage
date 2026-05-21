import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts";
import { Spinner } from "@/components/ui/spinner";
import { LogIn } from "lucide-react";
import univoyageIcon from "@/assets/univoyage_icon.svg";
import { ROUTE_PATHS } from "@/config/routes";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type { AuthResponse } from "@/config/apiConfig";
import type { User } from "@/types/user";

interface OAuthCallbackPageProps {
  provider: "GitHub" | "LinkedIn";
  callbackFn: (code: string) => Promise<AuthResponse<User>>;
}

export default function OAuthCallbackPage({
  provider,
  callbackFn,
}: OAuthCallbackPageProps) {
  useDocumentTitle("Signing in...");
  const navigate = useNavigate();
  const { loadUser } = useAuth();
  const ran = useRef(false);
  const isPopup = window.opener !== null;

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    if (error) {
      const errorMsg = `${provider} auth error: ${error}`;
      if (isPopup) {
        window.opener?.postMessage(
          { type: "OAUTH_ERROR", error: errorMsg },
          window.location.origin,
        );
        window.close();
      } else {
        toast.error(errorMsg);
        navigate(ROUTE_PATHS.HOME);
      }
      return;
    }

    if (!code) {
      const errorMsg = `Missing ${provider} authorization code`;
      if (isPopup) {
        window.opener?.postMessage(
          { type: "OAUTH_ERROR", error: errorMsg },
          window.location.origin,
        );
        window.close();
      } else {
        toast.error(errorMsg);
        navigate(ROUTE_PATHS.HOME);
      }
      return;
    }

    (async () => {
      try {
        const res = await callbackFn(code);

        if (!res.success) {
          const errorMsg = res.error || `${provider} login failed`;
          if (isPopup) {
            window.opener?.postMessage(
              { type: "OAUTH_ERROR", error: errorMsg },
              window.location.origin,
            );
            window.close();
          } else {
            toast.error(errorMsg);
            navigate(ROUTE_PATHS.HOME);
          }
          return;
        }

        await loadUser();

        const redirectUrl = sessionStorage.getItem("oauth_redirect");
        sessionStorage.removeItem("oauth_redirect");

        if (isPopup) {
          window.opener?.postMessage(
            { type: "OAUTH_SUCCESS" },
            window.location.origin,
          );
          window.close();
        } else {
          toast.success(`Signed in with ${provider}!`);
          navigate(redirectUrl || ROUTE_PATHS.HOME);
        }
      } catch (e: any) {
        const errorMsg = e?.message || `${provider} login failed`;
        if (isPopup) {
          window.opener?.postMessage(
            { type: "OAUTH_ERROR", error: errorMsg },
            window.location.origin,
          );
          window.close();
        } else {
          toast.error(errorMsg);
          navigate(ROUTE_PATHS.HOME);
        }
      }
    })();
  }, [navigate, loadUser, isPopup, provider, callbackFn]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img
            src={univoyageIcon}
            alt="UniVoyage Logo"
            className="w-10 h-10 sm:w-12 sm:h-12"
          />
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
            <div className="relative p-4 rounded-full bg-primary/10 border-2 border-primary/20">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">
            Signing you in with {provider}
          </h2>
          <p className="text-muted-foreground">
            Please wait while we complete your authentication...
          </p>
        </div>
        <div className="flex justify-center pt-2">
          <Spinner className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}
