import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, AuthProvider, DestinationProvider, TripProvider } from '@/contexts';
import { Header, Footer, ScrollToTop } from '@/components';
import { AuthLoadingOverlay } from '@/components/layout/AuthLoadingOverlay';
import { Toaster } from '@/components/ui/sonner';
import { ProtectedRoute } from '@/guards';
import { HomePage, AboutPage, TourPage, ContactPage, ProfilePage, MyTripsPage, TripDetailPage, PopularDestinationsPage, EuropeDestinationsPage, AmericasDestinationsPage, AsiaDestinationsPage, AfricaDestinationsPage } from '@/pages';
import { LoginDialog, SignUpDialog } from '@/components/auth';
import { useDestination } from '@/contexts/DestinationContext';
import GoogleCallbackPage from "@/pages/GoogleCallbackPage"


//todo improve this
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

  // Show login dialog when showAuthDialog is true
  React.useEffect(() => {
    if (showAuthDialog && !isLoginOpen && !isSignUpOpen) {
      setIsLoginOpen(true);
    }
  }, [showAuthDialog, isLoginOpen, isSignUpOpen]);

  return (
    <>
      <AuthLoadingOverlay />
      <Router>
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/tour" element={<TourPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/destinations" element={<PopularDestinationsPage />} />
          <Route path="/destinations/europe" element={<EuropeDestinationsPage />} />
          <Route path="/destinations/americas" element={<AmericasDestinationsPage />} />
          <Route path="/destinations/asia" element={<AsiaDestinationsPage />} />
          <Route path="/destinations/africa" element={<AfricaDestinationsPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-trips" 
            element={
              <ProtectedRoute>
                <MyTripsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/trips/:id" 
            element={
              <ProtectedRoute>
                <TripDetailPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
        <Footer />
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