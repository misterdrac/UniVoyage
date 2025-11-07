import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrips } from '@/contexts/TripContext';
import { Loader2 } from 'lucide-react';
import { EmptyTripsState } from '@/components/trips/EmptyTripsState';
import { TripCard } from '@/components/trips/TripCard';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { Trip } from '@/types/trip';

const MyTripsPage = () => {
  const { trips, isLoading, deleteTrip } = useTrips();
  const navigate = useNavigate();
  const [deletingTripId, setDeletingTripId] = useState<number | null>(null);
  const [pendingDeleteTrip, setPendingDeleteTrip] = useState<Trip | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const isDialogOpen = useMemo(() => pendingDeleteTrip !== null, [pendingDeleteTrip]);

  const handleRequestDeleteTrip = useCallback((trip: Trip) => {
    setPendingDeleteTrip(trip);
    setDeleteError(null);
  }, []);

  const handleCancelDeleteTrip = useCallback(() => {
    if (deletingTripId !== null) {
      return;
    }
    setPendingDeleteTrip(null);
    setDeleteError(null);
  }, [deletingTripId]);

  const handleConfirmDeleteTrip = useCallback(async () => {
    if (!pendingDeleteTrip) {
      return;
    }

    setDeletingTripId(pendingDeleteTrip.id);
    setDeleteError(null);
    try {
      const result = await deleteTrip(pendingDeleteTrip.id);
      if (result.success) {
        setPendingDeleteTrip(null);
        setDeleteError(null);
      }
      if (!result.success && result.error) {
        setDeleteError(result.error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete trip. Please try again.';
      setDeleteError(message);
      console.error('Error deleting trip:', error);
    } finally {
      setDeletingTripId(null);
    }
  }, [pendingDeleteTrip, deleteTrip]);

  const handleViewTrip = useCallback(
    (trip: Trip) => {
      navigate(`/trips/${trip.id}`);
    },
    [navigate]
  );

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
        
        {!trips.length ? (
          <EmptyTripsState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                isDeleting={deletingTripId === trip.id}
                onDelete={handleRequestDeleteTrip}
                onView={handleViewTrip}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={isDialogOpen}
        title="Delete trip"
        description={
          pendingDeleteTrip
            ? `Are you sure you want to delete your trip to ${pendingDeleteTrip.destinationName}? This action cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isConfirming={deletingTripId !== null}
        errorMessage={deleteError}
        onCancel={handleCancelDeleteTrip}
        onConfirm={handleConfirmDeleteTrip}
      />
    </div>
  );
};

export default MyTripsPage;
