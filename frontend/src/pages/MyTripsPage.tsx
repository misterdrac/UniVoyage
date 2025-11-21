import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrips } from '@/contexts/TripContext';
import { Loader2 } from 'lucide-react';
import { EmptyTripsState } from '@/components/trips/my-trips/EmptyTripsState';
import { DeleteTripDialog, TripFiltersBar, TripResultsSection } from '@/components/trips/my-trips';
import type { Trip } from '@/types/trip';
import {
  DEFAULT_TRIP_FILTERS,
  filterTrips,
  hasActiveTripFilters,
  type TripFilters,
  type TripStatusFilter,
} from '@/lib/tripFilters';
import { sortTrips, type TripSortOption } from '@/lib/tripSorting';
import { useDeleteTrip } from '@/hooks/useDeleteTrip';

const MyTripsPage = () => {
  const { trips, isLoading, deleteTrip } = useTrips();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<TripFilters>({ ...DEFAULT_TRIP_FILTERS });

  const {
    pendingDeleteTrip,
    isDeleting,
    deleteError,
    requestDelete: handleRequestDeleteTrip,
    cancelDelete: handleCancelDeleteTrip,
    confirmDelete: handleConfirmDeleteTrip,
  } = useDeleteTrip();

  const handleViewTrip = useCallback((trip: Trip) => {
    navigate(`/trips/${trip.id}`);
  }, [navigate]);

  const handleConfirmDelete = useCallback(async () => {
    await handleConfirmDeleteTrip(deleteTrip);
  }, [handleConfirmDeleteTrip, deleteTrip]);

  const handleStatusChange = useCallback((status: TripStatusFilter) => {
    setFilters((previous) => ({
      ...previous,
      status,
    }));
  }, []);

  const handleSortChange = useCallback((sort: TripSortOption) => {
    setFilters((previous) => ({
      ...previous,
      sort,
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_TRIP_FILTERS });
  }, []);

  const filteredTrips = useMemo(() => filterTrips(trips, filters), [trips, filters]);
  const sortedTrips = useMemo(() => sortTrips(filteredTrips, filters.sort), [filteredTrips, filters.sort]);
  const hasActiveFilters = useMemo(() => hasActiveTripFilters(filters), [filters]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background px-8 pt-24 pb-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 pt-24 pb-8 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">My Trips</h1>
          <p className="text-muted-foreground">Manage and view all your planned adventures</p>
        </div>

        {!trips.length ? (
          <EmptyTripsState />
        ) : (
          <>
            <TripFiltersBar
              filters={filters}
              totalTrips={trips.length}
              visibleTrips={sortedTrips.length}
              hasActiveFilters={hasActiveFilters}
              onStatusChange={handleStatusChange}
              onSortChange={handleSortChange}
              onResetFilters={handleResetFilters}
            />
            <TripResultsSection
              trips={sortedTrips}
              deletingTripId={pendingDeleteTrip?.id ?? null}
              hasActiveFilters={hasActiveFilters}
              onResetFilters={handleResetFilters}
              onDeleteTrip={handleRequestDeleteTrip}
              onViewTrip={handleViewTrip}
            />
          </>
        )}
      </div>

      <DeleteTripDialog
        open={pendingDeleteTrip !== null}
        trip={pendingDeleteTrip}
        isConfirming={isDeleting}
        errorMessage={deleteError}
        onCancel={handleCancelDeleteTrip}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default MyTripsPage;
