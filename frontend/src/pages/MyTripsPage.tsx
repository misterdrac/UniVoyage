import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrips } from '@/contexts/TripContext';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Plane, Loader2, ArrowRight, Clock, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateTripStatus } from '@/lib/tripUtils';
import { formatDateShort, formatDateLong, calculateDurationInDays } from '@/lib/dateUtils';
import { getStatusConfig } from '@/lib/tripStatusUtils';
import { getDestinationImageById } from '@/lib/destinationUtils';

const MyTripsPage = () => {
  const { trips, isLoading, deleteTrip } = useTrips();
  const navigate = useNavigate();
  const [deletingTripId, setDeletingTripId] = useState<number | null>(null);

  const handleDeleteTrip = async (tripId: number, tripName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    
    const confirmed = window.confirm(
      `Are you sure you want to delete your trip to ${tripName}? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    setDeletingTripId(tripId);
    try {
      await deleteTrip(tripId);
    } catch (error) {
      console.error('Error deleting trip:', error);
    } finally {
      setDeletingTripId(null);
    }
  };

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

  return (
    <div className="min-h-screen bg-background pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">My Trips</h1>
          <p className="text-muted-foreground">Manage and view all your planned adventures</p>
        </div>
        
        {trips.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Plane className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No trips yet</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Your trips will be displayed here. Start planning your first adventure!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => {
              // Calculate status dynamically based on current date
              const currentStatus = calculateTripStatus(trip.departureDate, trip.returnDate);
              const statusConfig = getStatusConfig(currentStatus);
              const duration = calculateDurationInDays(trip.departureDate, trip.returnDate);
              const imageUrl = getDestinationImageById(trip.destinationId);

              return (
                <Card
                  key={trip.id}
                  className={cn(
                    "group relative overflow-hidden border-2 transition-all duration-300",
                    "hover:shadow-xl hover:scale-[1.02] hover:border-primary/30",
                    "bg-card"
                  )}
                >
                  {/* Hero Image Section */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={trip.destinationName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Status Badge and Delete Button - Top Right */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
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
                      <button
                        onClick={(e) => handleDeleteTrip(trip.id, trip.destinationName, e)}
                        disabled={deletingTripId === trip.id}
                        className={cn(
                          "p-2 rounded-full backdrop-blur-sm transition-all",
                          "text-white hover:bg-red-500/20 hover:text-red-200",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                          "border border-white/20 hover:border-red-500/30"
                        )}
                        aria-label={`Delete trip to ${trip.destinationName}`}
                      >
                        {deletingTripId === trip.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Destination Name Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-xl font-bold text-white drop-shadow-lg">
                        {trip.destinationName}
                      </h3>
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-4">
                    {/* Location */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm font-medium">{trip.destinationLocation}</span>
                    </div>

                    {/* Date Range */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0 text-primary" />
                      <div className="flex flex-col text-sm">
                        <span className="font-medium">
                          {formatDateShort(trip.departureDate)} - {formatDateShort(trip.returnDate)}
                        </span>
                        <span className="text-xs text-muted-foreground/80">
                          {formatDateLong(trip.departureDate)}
                        </span>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm">
                        <span className="font-semibold text-foreground">{duration}</span> day{duration !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-border" />

                    {/* Action Button */}
                    <button
                      onClick={() => navigate(`/trips/${trip.id}`)}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 px-4 py-2.5",
                        "text-sm font-semibold rounded-lg",
                        "bg-primary text-primary-foreground",
                        "hover:bg-primary/90 transition-all duration-200",
                        "group/btn"
                      )}
                    >
                      <span>View Details</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTripsPage;
