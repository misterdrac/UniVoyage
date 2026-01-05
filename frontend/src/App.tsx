import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, AuthProvider, DestinationProvider, TripProvider } from '@/contexts';
import { Header, Footer, ScrollToTop } from '@/components';
import { AuthLoadingOverlay } from '@/components/layout/AuthLoadingOverlay';
import { Toaster } from '@/components/ui/sonner';
import { ProtectedRoute, AdminProtectedRoute } from '@/guards';
import { HomePage, AboutPage, TourPage, ContactPage, ProfilePage, MyTripsPage, TripDetailPage, PopularDestinationsPage, EuropeDestinationsPage, AmericasDestinationsPage, AsiaDestinationsPage, AfricaDestinationsPage } from '@/pages';
import { AdminLoginPage, AdminDashboardPage, AdminUsersPage, AdminDestinationsPage } from '@/pages/admin';
import { LoginDialog, SignUpDialog } from '@/components/auth';
import { useDestination } from '@/contexts/DestinationContext';
import GoogleCallbackPage from "@/pages/GoogleCallbackPage"


// Layout component for main app (with Header/Footer)
function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

// Wrapper component to handle conditional layout
function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <Routes>
      {/* Admin Routes - No Header/Footer */}
      <Route path="/admin" element={<AdminLoginPage />} />
      <Route 
        path="/admin/dashboard" 
        element={
          <AdminProtectedRoute>
            <AdminDashboardPage />
          </AdminProtectedRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <AdminProtectedRoute>
            <AdminUsersPage />
          </AdminProtectedRoute>
        } 
      />
      <Route 
        path="/admin/destinations" 
        element={
          <AdminProtectedRoute>
            <AdminDestinationsPage />
          </AdminProtectedRoute>
        } 
      />

      {/* Main App Routes - With Header/Footer */}
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
      <Route path="/about" element={<MainLayout><AboutPage /></MainLayout>} />
      <Route path="/tour" element={<MainLayout><TourPage /></MainLayout>} />
      <Route path="/contact" element={<MainLayout><ContactPage /></MainLayout>} />
      <Route path="/destinations" element={<MainLayout><PopularDestinationsPage /></MainLayout>} />
      <Route path="/destinations/europe" element={<MainLayout><EuropeDestinationsPage /></MainLayout>} />
      <Route path="/destinations/americas" element={<MainLayout><AmericasDestinationsPage /></MainLayout>} />
      <Route path="/destinations/asia" element={<MainLayout><AsiaDestinationsPage /></MainLayout>} />
      <Route path="/destinations/africa" element={<MainLayout><AfricaDestinationsPage /></MainLayout>} />
      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
      <Route 
        path="/profile" 
        element={
          <MainLayout>
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          </MainLayout>
        } 
      />
      <Route 
        path="/my-trips" 
        element={
          <MainLayout>
            <ProtectedRoute>
              <MyTripsPage />
            </ProtectedRoute>
          </MainLayout>
        } 
      />
      <Route 
        path="/trips/:id" 
        element={
          <MainLayout>
            <ProtectedRoute>
              <TripDetailPage />
            </ProtectedRoute>
          </MainLayout>
        } 
      />
    </Routes>
  );
}

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