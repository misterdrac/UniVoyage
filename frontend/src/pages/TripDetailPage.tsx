import { useCallback, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrips } from '@/contexts/TripContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  MapPin,
  Clock,
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
import { formatDateLong, calculateDurationInDays } from '@/lib/dateUtils';
import { getDestinationImageById } from '@/lib/destinationUtils';
import { WeatherWidget } from '@/components/ui/weather-widget';
import { TripHeroSection, TripSectionTabs, TripSectionCard } from '@/components/trips';
import type { TripSectionDefinition } from '@/components/trips';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

type Section = 'overview' | 'budget' | 'accommodation' | 'things-to-visit' | 'map' | 'weather' | 'itinerary';

const TripDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTripById, isLoading, deleteTrip } = useTrips();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
  }, []);

  const handleCancelDeleteTrip = useCallback(() => {
    if (isDeleting) {
      return;
    }
    setIsDeleteDialogOpen(false);
  }, [isDeleting]);

  const handleConfirmDeleteTrip = useCallback(async () => {
    if (!tripId || !trip) return;

    setIsDeleting(true);
    try {
      const result = await deleteTrip(tripId);
      if (result.success) {
        setIsDeleteDialogOpen(false);
        navigate('/my-trips');
      }
    } catch (error) {
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
            <TripSectionCard icon={activeSectionData.icon} title={activeSectionData.label}>
              {activeSection === 'overview' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Trip Overview</h3>
                    <p className="text-muted-foreground leading-relaxed text-base">
                      This is your trip to {trip.destinationName}, {trip.destinationLocation}. Your journey begins on{' '}
                      {formatDateLong(trip.departureDate)} and concludes on {formatDateLong(trip.returnDate)}.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-4">Quick Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Card className="p-5 rounded-xl border bg-card hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className="size-5 text-primary" />
                          <p className="text-sm text-muted-foreground">Duration</p>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{duration} day{duration !== 1 ? 's' : ''}</p>
                      </Card>
                      <Card className="p-5 rounded-xl border bg-card hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                          <MapPin className="size-5 text-primary" />
                          <p className="text-sm text-muted-foreground">Destination</p>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{trip.destinationLocation}</p>
                      </Card>
                    </div>
                  </div>

                  {/* Weather Section */}
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-4">Weather</h3>
                    {currentStatus === 'ongoing' ? (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">Current Weather Conditions</p>
                        <WeatherWidget
                          apiKey={import.meta.env.VITE_OPENWEATHER_API_KEY}
                          cityName={trip.destinationName}
                          locationName={trip.destinationLocation}
                          width="100%"
                          animated={true}
                        />
                      </div>
                    ) : (
                      <WeatherWidget
                        apiKey={import.meta.env.VITE_OPENWEATHER_API_KEY}
                        forecastMode={{
                          cityName: trip.destinationName,
                          locationName: trip.destinationLocation,
                          departureDate: trip.departureDate,
                          returnDate: trip.returnDate,
                        }}
                        width="100%"
                        animated={true}
                      />
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">What's Next?</h3>
                    <p className="text-muted-foreground leading-relaxed text-base">
                      Use the navigation tabs above to explore different sections of your trip. You can manage your budget,
                      view accommodation details, discover places to visit, check the map, see weather forecasts, and
                      plan your itinerary.
                    </p>
                  </div>
                </div>
              )}

              {activeSection === 'budget' && (
                <div className="space-y-6">
                  <p className="text-muted-foreground">Budget management will be available here.</p>
                </div>
              )}

              {activeSection === 'accommodation' && (
                <div className="space-y-6">
                  <p className="text-muted-foreground">Accommodation details will be available here.</p>
                </div>
              )}

              {activeSection === 'things-to-visit' && (
                <div className="space-y-6">
                  <p className="text-muted-foreground">Places to visit will be listed here.</p>
                </div>
              )}

              {activeSection === 'map' && (
                <div className="space-y-6">
                  <p className="text-muted-foreground">Interactive map will be displayed here.</p>
                </div>
              )}

              {activeSection === 'weather' && (
                <div className="space-y-6">
                  {/* Main Weather Display */}
                  {currentStatus === 'ongoing' ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-lg font-semibold text-foreground mb-2">Current Weather</h4>
                        <WeatherWidget
                          apiKey={import.meta.env.VITE_OPENWEATHER_API_KEY}
                          cityName={trip.destinationName}
                          locationName={trip.destinationLocation}
                          width="100%"
                          animated={true}
                        />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-foreground mb-2">Remaining Trip Forecast</h4>
                        <WeatherWidget
                          apiKey={import.meta.env.VITE_OPENWEATHER_API_KEY}
                          forecastMode={{
                            cityName: trip.destinationName,
                            locationName: trip.destinationLocation,
                            departureDate: trip.departureDate,
                            returnDate: trip.returnDate,
                          }}
                          width="100%"
                          animated={true}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-lg font-semibold text-foreground mb-2">Trip Forecast</h4>
                        <WeatherWidget
                          apiKey={import.meta.env.VITE_OPENWEATHER_API_KEY}
                          forecastMode={{
                            cityName: trip.destinationName,
                            locationName: trip.destinationLocation,
                            departureDate: trip.departureDate,
                            returnDate: trip.returnDate,
                          }}
                          width="100%"
                          animated={true}
                        />
                      </div>
                      <Card className="p-6 border-2 border-dashed">
                        <CardContent className="p-0">
                          <p className="text-sm text-muted-foreground text-center">
                            💡 <strong>Tip:</strong> Weather forecasts are most accurate within 5 days. 
                            Check back closer to your trip for the most up-to-date information.
                          </p>
                        </CardContent>
                      </Card>
                      
                      {/* Future Enhancements Placeholder */}
                      <Card className="p-6 border-2 border-dashed bg-muted/30">
                        <CardContent className="p-0 space-y-3">
                          <h4 className="text-base font-semibold text-foreground">Coming Soon</h4>
                          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                            <li>Hourly forecast for the next 24-48 hours</li>
                            <li>Extended forecast for the full trip duration</li>
                            <li>Detailed weather metrics (humidity, wind speed, UV index)</li>
                            <li>Weather alerts and warnings</li>
                            <li>Packing suggestions based on forecast</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'itinerary' && (
                <div className="space-y-6">
                  <p className="text-muted-foreground">Your detailed itinerary will be displayed here.</p>
                </div>
              )}
            </TripSectionCard>
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
        onCancel={handleCancelDeleteTrip}
        onConfirm={handleConfirmDeleteTrip}
      />
    </div>
  );
};

export default TripDetailPage;

