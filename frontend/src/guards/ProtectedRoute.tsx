import React from "react";
import { Loader2 } from "lucide-react";
import { Navigate } from "react-router-dom";
import { AuthStatusLayout } from "@/components/auth/AuthStatusLayout";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTE_PATHS } from "@/config/routes";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protects routes that require authentication
 * Redirects to home if user is not logged in
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <AuthStatusLayout
        title="Checking your session"
        description="Please wait while we verify you're signed in…"
        icon={
          <Loader2 className="h-8 w-8 text-primary animate-spin" aria-hidden />
        }
      />
    );
  }

  // Redirect to home if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTE_PATHS.HOME} replace />;
  }

  // Render protected content if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
