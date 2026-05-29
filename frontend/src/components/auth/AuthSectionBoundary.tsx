import React from "react";
import { Loader2 } from "lucide-react";

interface AuthSectionBoundaryProps {
  isLoading?: boolean;
  error?: string | null;
  loadingMessage?: string;
  children: React.ReactNode;
}

/**
 * Shared loading / error shell for authenticated sections (profile, account).
 */
export function AuthSectionBoundary({
  isLoading,
  error,
  loadingMessage = "Loading…",
  children,
}: AuthSectionBoundaryProps) {
  if (isLoading) {
    return (
      <div
        className="flex items-center gap-2 text-sm text-muted-foreground py-4"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span>{loadingMessage}</span>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive py-2" role="alert">
        {error}
      </p>
    );
  }

  return <>{children}</>;
}
