import React, { useState, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ThemeProvider,
  AuthProvider,
  DestinationProvider,
  TripProvider,
} from "@/contexts";
import { ScrollToTop } from "@/components";
import { AuthLoadingOverlay } from "@/components/layout/AuthLoadingOverlay";
import { Toaster } from "@/components/ui/sonner";
import { LoginDialog, SignUpDialog } from "@/components/auth";
import {
  useDestination,
  RouteChangeHandler,
} from "@/contexts/DestinationContext";
import { routes, createRouteElement } from "@/config/routes";

/**
 * AppRoutes component that renders all routes from centralized configuration
 */
function AppRoutes() {
  return (
    <Routes>
      {routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={createRouteElement(route)}
        />
      ))}
    </Routes>
  );
}

function AuthDialogQueryController({
  onOpenLogin,
}: {
  onOpenLogin: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("login") !== "1") return;

    onOpenLogin();
    params.delete("login");
    navigate(
      {
        pathname: location.pathname,
        search: params.toString() ? `?${params.toString()}` : "",
      },
      { replace: true },
    );
  }, [location.pathname, location.search, navigate, onOpenLogin]);

  return null;
}

/**
 * AppContent component manages authentication dialogs and routing
 * Handles coordination between destination context auth dialog trigger
 * and login/signup dialog states
 */
function AppContent() {
  const { showAuthDialog, setShowAuthDialog } = useDestination();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  const handleLoginClick = useCallback(() => {
    setIsLoginOpen(true);
    setShowAuthDialog(false);
  }, [setShowAuthDialog]);

  const handleSignUpClick = useCallback(() => {
    setIsSignUpOpen(true);
    setIsLoginOpen(false);
    setShowAuthDialog(false);
  }, [setShowAuthDialog]);

  const handleOpenLoginFromRoute = useCallback(() => {
    setIsLoginOpen(true);
    setIsSignUpOpen(false);
    setShowAuthDialog(false);
  }, [setShowAuthDialog]);

  // Show login dialog when showAuthDialog is triggered from destination context
  React.useEffect(() => {
    if (showAuthDialog && !isLoginOpen && !isSignUpOpen) {
      setIsLoginOpen(true);
    }
  }, [showAuthDialog, isLoginOpen, isSignUpOpen]);

  return (
    <>
      <AuthLoadingOverlay />
      <Router>
        <AuthDialogQueryController onOpenLogin={handleOpenLoginFromRoute} />
        <RouteChangeHandler />
        <ScrollToTop />
        <AppRoutes />
        <Toaster />
      </Router>

      <LoginDialog
        open={isLoginOpen}
        onOpenChange={(open) => {
          setIsLoginOpen(open);
          if (!open) setShowAuthDialog(false);
        }}
        onSignUpClick={handleSignUpClick}
      />

      <SignUpDialog
        open={isSignUpOpen}
        onOpenChange={(open) => {
          setIsSignUpOpen(open);
          if (!open) setShowAuthDialog(false);
        }}
        onLoginClick={handleLoginClick}
      />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TripProvider>
          <DestinationProvider>
            <AppContent />
          </DestinationProvider>
        </TripProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
