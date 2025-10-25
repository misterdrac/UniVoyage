import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, AuthProvider } from '@/contexts';
import { Header } from '@/components';
import { Toaster } from '@/components/ui/sonner';
import { ProtectedRoute } from '@/guards';
import { HomePage, AboutPage, TourPage, ContactPage, ProfilePage } from '@/pages';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/tour" element={<TourPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;