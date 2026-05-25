import { createPortal } from "react-dom";
import { Loader2, LogIn } from "lucide-react";
import univoyageIcon from "@/assets/univoyage_icon.svg";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const SIGN_IN_OVERLAY_WAIT_MESSAGE =
  "Please wait a moment while you sign in.";

export function signInOverlayMethodMessage(method: string): string {
  return `Signing you in via ${method}.`;
}

interface AuthSignInOverlayProps {
  open: boolean;
  method?: string | null;
  /** When set, replaces the default “Signing you in via …” title. */
  title?: string;
  description?: string;
}

/**
 * Full-viewport sign-in progress layer (replaces OAuth popups and generic loaders).
 */
export function AuthSignInOverlay({
  open,
  method,
  title,
  description = SIGN_IN_OVERLAY_WAIT_MESSAGE,
}: AuthSignInOverlayProps) {
  if (!open || typeof document === "undefined") {
    return null;
  }

  const methodLine = method?.trim()
    ? signInOverlayMethodMessage(method.trim())
    : null;
  const heading = title ?? methodLine ?? "Signing you in";

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-labelledby="auth-sign-in-overlay-title"
      aria-describedby="auth-sign-in-overlay-desc"
    >
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-3 text-center">
          <div className="flex justify-center">
            <img
              src={univoyageIcon}
              alt=""
              aria-hidden
              className="h-12 w-12 sm:h-14 sm:w-14"
            />
          </div>
          <h2 className="bg-linear-to-r from-primary to-primary/70 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
            UniVoyage
          </h2>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader className="space-y-4 pb-2 text-center">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
                <div className="relative rounded-full border-2 border-primary/20 bg-primary/10 p-4">
                  <LogIn className="h-8 w-8 text-primary" aria-hidden />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle
                id="auth-sign-in-overlay-title"
                className="text-xl sm:text-2xl"
              >
                {heading}
              </CardTitle>
              <CardDescription
                id="auth-sign-in-overlay-desc"
                className="text-base"
              >
                {description}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center pb-8 pt-2">
            <Loader2
              className="h-8 w-8 animate-spin text-primary"
              aria-label="Loading"
            />
          </CardContent>
        </Card>
      </div>
    </div>,
    document.body,
  );
}
