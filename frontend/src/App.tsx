import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, AuthProvider, DestinationProvider } from '@/contexts';
import { Header } from '@/components';
import { Toaster } from '@/components/ui/sonner';
import { ProtectedRoute } from '@/guards';
import { HomePage, AboutPage, TourPage, ContactPage, ProfilePage, MyTripsPage, PopularDestinationsPage, EuropeDestinationsPage, AmericasDestinationsPage, AsiaDestinationsPage, AfricaDestinationsPage } from '@/pages';


//todo improve this
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DestinationProvider>
          <Router>
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
          </Routes>
          <Toaster />
        </Router>
        </DestinationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;