import { useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  TripItinerarySection,
  TripPointsOfInterestSection,
} from '@/components/trips';
import type { TripSectionDefinition } from '@/components/trips';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useDeleteTrip } from '@/hooks/useDeleteTrip';

type Section = 'overview' | 'budget' | 'accommodation' | 'things-to-visit' | 'map' | 'weather' | 'itinerary';

// Sections configuration - constant outside component for better performance
const TRIP_SECTIONS: TripSectionDefinition<Section>[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'accommodation', label: 'Accommodation', icon: Hotel },
  { id: 'things-to-visit', label: 'Things to Visit', icon: MapPinIcon },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'weather', label: 'Weather', icon: Cloud },
  { id: 'itinerary', label: 'Itinerary', icon: Calendar },
];

// Valid section IDs for quick lookup - constant
const VALID_SECTION_IDS = new Set(TRIP_SECTIONS.map(s => s.id));

// Weather API key - memoized at module level
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined;

const TripDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getTripById, isLoading, deleteTrip } = useTrips();
  const tripId = id ? parseInt(id, 10) : null;
  const trip = tripId ? getTripById(tripId) : undefined;

  const {
    pendingDeleteTrip,
    isDeleting,
    deleteError,
    requestDelete: handleRequestDeleteTrip,
    cancelDelete: handleCancelDeleteTrip,
    confirmDelete: handleConfirmDeleteTrip,
  } = useDeleteTrip({
    onSuccess: () => navigate('/my-trips'),
  });

  // Derive active section directly from URL (single source of truth)
  const activeSection = useMemo<Section>(() => {
    const sectionParam = searchParams.get('section');
    return (sectionParam && VALID_SECTION_IDS.has(sectionParam as Section)) 
      ? (sectionParam as Section)
      : 'overview';
  }, [searchParams]);

  // Memoize derived trip data to avoid recalculation on every render
  const tripData = useMemo(() => {
    if (!trip) return null;
    return {
      currentStatus: calculateTripStatus(trip.departureDate, trip.returnDate),
      duration: calculateDurationInDays(trip.departureDate, trip.returnDate),
      imageUrl: getDestinationImageById(trip.destinationId),
    };
  }, [trip]);

  const activeSectionData = TRIP_SECTIONS.find((s) => s.id === activeSection);

  const handleBack = useCallback(() => {
    navigate('/my-trips');
  }, [navigate]);

  const handleSectionChange = useCallback((section: Section) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (section === 'overview') {
        next.delete('section');
      } else {
        next.set('section', section);
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const handleConfirmDelete = useCallback(async () => {
    if (!trip) return;
    await handleConfirmDeleteTrip(deleteTrip);
  }, [trip, handleConfirmDeleteTrip, deleteTrip]);

  // Request delete when trip is available
  const handleDeleteClick = useCallback(() => {
    if (trip) handleRequestDeleteTrip(trip);
  }, [trip, handleRequestDeleteTrip]);

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

  if (!trip || !tripData) {
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

  const { currentStatus, duration, imageUrl } = tripData;

  return (
    <div className="min-h-screen bg-background">
      <TripHeroSection
        trip={trip}
        duration={duration}
        status={currentStatus}
        imageUrl={imageUrl}
        isDeleting={isDeleting}
        onBack={handleBack}
        onDelete={handleDeleteClick}
      />

      <TripSectionTabs
        sections={TRIP_SECTIONS}
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
                    openWeatherApiKey={OPENWEATHER_API_KEY}
                  />
                )}

                {activeSection === 'budget' && (
                  <TripBudgetSection trip={trip} />
                )}

                {activeSection === 'accommodation' && (
                  <TripPlaceholderSection message="Accommodation details will be available here." />
                )}

                {activeSection === 'things-to-visit' && (
                  <TripPointsOfInterestSection trip={trip} />
                )}

                {activeSection === 'map' && (
                  <TripPlaceholderSection message="Interactive map will be displayed here." />
                )}

                {activeSection === 'weather' && (
                  <TripWeatherSection
                    trip={trip}
                    currentStatus={currentStatus}
                    openWeatherApiKey={OPENWEATHER_API_KEY}
                  />
                )}

                {activeSection === 'itinerary' && (
                  <TripItinerarySection trip={trip} currentStatus={currentStatus} />
                )}
              </TripSectionCard>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={pendingDeleteTrip !== null}
        title="Delete trip"
        description={`Are you sure you want to delete your trip to ${trip.destinationName}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isConfirming={isDeleting}
        errorMessage={deleteError}
        onCancel={handleCancelDeleteTrip}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default TripDetailPage;

