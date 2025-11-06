import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrips } from '@/contexts/TripContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { destinations } from '@/data/destinations';
import { calculateTripStatus } from '@/lib/tripUtils';
import { WeatherWidget } from '@/components/ui/weather-widget';

type Section = 'overview' | 'budget' | 'accommodation' | 'things-to-visit' | 'map' | 'weather' | 'itinerary';

const TripDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTripById, isLoading, deleteTrip } = useTrips();
  const [isDeleting, setIsDeleting] = useState(false);

  const tripId = id ? parseInt(id, 10) : null;
  const trip = tripId ? getTripById(tripId) : undefined;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'planned':
        return {
          bg: 'bg-blue-500/10 dark:bg-blue-500/20',
          text: 'text-blue-600 dark:text-blue-400',
          border: 'border-blue-500/30 dark:border-blue-500/40',
          icon: '📅',
        };
      case 'ongoing':
        return {
          bg: 'bg-green-500/10 dark:bg-green-500/20',
          text: 'text-green-600 dark:text-green-400',
          border: 'border-green-500/30 dark:border-green-500/40',
          icon: '✈️',
        };
      case 'completed':
        return {
          bg: 'bg-gray-500/10 dark:bg-gray-500/20',
          text: 'text-gray-600 dark:text-gray-400',
          border: 'border-gray-500/30 dark:border-gray-500/40',
          icon: '✓',
        };
      default:
        return {
          bg: 'bg-gray-500/10 dark:bg-gray-500/20',
          text: 'text-gray-600 dark:text-gray-400',
          border: 'border-gray-500/30 dark:border-gray-500/40',
          icon: '📋',
        };
    }
  };

  const getDestinationImage = (destinationId: number) => {
    const destination = destinations.find(d => d.id === destinationId);
    return destination?.imageUrl || 'https://images.unsplash.com/photo-1613744696511-fd64320d6c7b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074';
  };

  const sections: { id: Section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'budget', label: 'Budget', icon: Wallet },
    { id: 'accommodation', label: 'Accommodation', icon: Hotel },
    { id: 'things-to-visit', label: 'Things to Visit', icon: MapPinIcon },
    { id: 'map', label: 'Map', icon: Map },
    { id: 'weather', label: 'Weather', icon: Cloud },
    { id: 'itinerary', label: 'Itinerary', icon: Calendar },
  ];

  const [activeSection, setActiveSection] = useState<Section>('overview');

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
  const statusConfig = getStatusConfig(currentStatus);
  const duration = calculateDuration(trip.departureDate, trip.returnDate);
  const imageUrl = getDestinationImage(trip.destinationId);
  const activeSectionData = sections.find((s) => s.id === activeSection);

  const handleDeleteTrip = async () => {
    if (!tripId) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete your trip to ${trip.destinationName}? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteTrip(tripId);
      if (result.success) {
        navigate('/my-trips');
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative w-full h-[400px] sm:h-[500px] overflow-hidden">
        <img
          src={imageUrl}
          alt={trip.destinationName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/10 to-black/60" />

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
            <div className="max-w-3xl">
              <div className="mb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/my-trips')}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Trips
                </Button>
              </div>
              <div className="mb-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 drop-shadow-lg">
                  {trip.destinationName}
                </h1>
                <p className="text-xl sm:text-2xl text-white/90 mb-4 drop-shadow-md">
                  {trip.destinationLocation}
                </p>
              </div>
              <div className="flex items-center gap-4 flex-wrap text-white/90">
                <div className="flex items-center gap-2">
                  <Calendar className="size-5" />
                  <span className="text-lg">
                    {formatDate(trip.departureDate)} - {formatDate(trip.returnDate)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="size-5" />
                    <span className="text-lg">{duration} day{duration !== 1 ? 's' : ''}</span>
                  </div>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border backdrop-blur-sm',
                      statusConfig.bg,
                      statusConfig.text,
                      statusConfig.border
                    )}
                  >
                    <span>{statusConfig.icon}</span>
                    <span className="capitalize">{currentStatus}</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDeleteTrip}
                    disabled={isDeleting}
                    className="text-white hover:bg-red-500/20 hover:text-red-200 disabled:opacity-50"
                    aria-label="Delete trip"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Sticky */}
      <div className="sticky top-[68px] z-40 bg-background/95 backdrop-blur-sm border-b -mt-px">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap',
                    'border-b-2 border-transparent',
                    isActive
                      ? 'text-primary border-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  <Icon className="size-4" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                {activeSectionData && (
                  <>
                    <div className="p-2 rounded-lg bg-primary/10">
                      <activeSectionData.icon className="size-5 text-primary" />
                    </div>
                    <CardTitle className="text-2xl sm:text-3xl">{activeSectionData.label}</CardTitle>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {activeSection === 'overview' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Trip Overview</h3>
                    <p className="text-muted-foreground leading-relaxed text-base">
                      This is your trip to {trip.destinationName}, {trip.destinationLocation}. Your journey begins on{' '}
                      {formatDate(trip.departureDate)} and concludes on {formatDate(trip.returnDate)}.
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TripDetailPage;

