import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, AuthProvider, DestinationProvider, TripProvider } from '@/contexts';
import { ScrollToTop } from '@/components';
import { AuthLoadingOverlay } from '@/components/layout/AuthLoadingOverlay';
import { Toaster } from '@/components/ui/sonner';
import { LoginDialog, SignUpDialog } from '@/components/auth';
import { useDestination, RouteChangeHandler } from '@/contexts/DestinationContext';
import { routes, createRouteElement } from '@/config/routes';

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