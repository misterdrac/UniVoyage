import { useCallback, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrips } from '@/contexts/TripContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  ArrowLeft,
  LayoutDashboard,
  Wallet,
  Hotel,
  MapPin as MapPinIcon,
  Map,
  Cloud,
  Loader2,
} from 'lucide-react';
import { calculateTripStatus } from '@/lib/tripUtils';
import { calculateDurationInDays } from '@/lib/dateUtils';
import { getDestinationImageById } from '@/lib/destinationUtils';
import {
  TripHeroSection,
  TripSectionTabs,
  TripSectionCard,
  TripOverviewSection,
  TripWeatherSection,
  TripBudgetSection,
  TripPlaceholderSection,
} from '@/components/trips';
import type { TripSectionDefinition } from '@/components/trips';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

type Section = 'overview' | 'budget' | 'accommodation' | 'things-to-visit' | 'map' | 'weather' | 'itinerary';

const TripDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTripById, isLoading, deleteTrip } = useTrips();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const tripId = id ? parseInt(id, 10) : null;
  const trip = tripId ? getTripById(tripId) : undefined;

  const sections = useMemo<TripSectionDefinition<Section>[]>(
    () => [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'budget', label: 'Budget', icon: Wallet },
      { id: 'accommodation', label: 'Accommodation', icon: Hotel },
      { id: 'things-to-visit', label: 'Things to Visit', icon: MapPinIcon },
      { id: 'map', label: 'Map', icon: Map },
      { id: 'weather', label: 'Weather', icon: Cloud },
      { id: 'itinerary', label: 'Itinerary', icon: Calendar },
    ],
    []
  );

  const [activeSection, setActiveSection] = useState<Section>('overview');

  const activeSectionData = useMemo(
    () => sections.find((s) => s.id === activeSection),
    [sections, activeSection]
  );

  const handleBack = useCallback(() => {
    navigate('/my-trips');
  }, [navigate]);

  const handleSectionChange = useCallback((section: Section) => {
    setActiveSection(section);
  }, []);

  const handleRequestDeleteTrip = useCallback(() => {
    setIsDeleteDialogOpen(true);
    setDeleteError(null);
  }, []);

  const handleCancelDeleteTrip = useCallback(() => {
    if (isDeleting) {
      return;
    }
    setIsDeleteDialogOpen(false);
    setDeleteError(null);
  }, [isDeleting]);

  const handleConfirmDeleteTrip = useCallback(async () => {
    if (!tripId || !trip) return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      const result = await deleteTrip(tripId);
      if (result.success) {
        setIsDeleteDialogOpen(false);
        navigate('/my-trips');
      } else if (result.error) {
        setDeleteError(result.error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete trip. Please try again.';
      setDeleteError(message);
      console.error('Error deleting trip:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [tripId, trip, deleteTrip, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-8 px-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-8 px-8">
        <div className="container mx-auto">
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">Trip not found</h3>
              <p className="text-muted-foreground text-center mb-4">
                The trip you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate('/my-trips')} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to My Trips
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentStatus = calculateTripStatus(trip.departureDate, trip.returnDate);
  const duration = calculateDurationInDays(trip.departureDate, trip.returnDate);
  const imageUrl = getDestinationImageById(trip.destinationId);
  const openWeatherApiKey = import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined;

  return (
    <div className="min-h-screen bg-background">
      <TripHeroSection
        trip={trip}
        duration={duration}
        status={currentStatus}
        imageUrl={imageUrl}
        isDeleting={isDeleting}
        onBack={handleBack}
        onDelete={handleRequestDeleteTrip}
      />

      <TripSectionTabs
        sections={sections}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto">
          {activeSectionData && (
            <div
              id={`${activeSection}-panel`}
              role="tabpanel"
              aria-labelledby={`${activeSection}-tab`}
            >
              <TripSectionCard icon={activeSectionData.icon} title={activeSectionData.label}>
              {activeSection === 'overview' && (
                <TripOverviewSection
                  trip={trip}
                  duration={duration}
                  currentStatus={currentStatus}
                  openWeatherApiKey={openWeatherApiKey}
                />
              )}

              {activeSection === 'budget' && (
                <TripBudgetSection trip={trip} />
              )}

              {activeSection === 'accommodation' && (
                <TripPlaceholderSection message="Accommodation details will be available here." />
              )}

              {activeSection === 'things-to-visit' && (
                <TripPlaceholderSection message="Places to visit will be listed here." />
              )}

              {activeSection === 'map' && (
                <TripPlaceholderSection message="Interactive map will be displayed here." />
              )}

              {activeSection === 'weather' && (
                <TripWeatherSection
                  trip={trip}
                  currentStatus={currentStatus}
                  openWeatherApiKey={openWeatherApiKey}
                />
              )}

              {activeSection === 'itinerary' && (
                <TripPlaceholderSection message="Your detailed itinerary will be displayed here." />
              )}
              </TripSectionCard>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Delete trip"
        description={`Are you sure you want to delete your trip to ${trip.destinationName}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isConfirming={isDeleting}
        errorMessage={deleteError}
        onCancel={handleCancelDeleteTrip}
        onConfirm={handleConfirmDeleteTrip}
      />
    </div>
  );
};

export default TripDetailPage;

