import { useAuth } from "@/contexts/AuthContext";
import { AuthSignInOverlay } from "@/components/auth/AuthSignInOverlay";

export function AuthLoadingOverlay() {
  const { isLoading, signInOverlayMethod } = useAuth();

  return (
    <AuthSignInOverlay
      open={isLoading && !signInOverlayMethod}
      title="Loading"
      description="Please wait a moment while we load your account."
    />
  );
}
