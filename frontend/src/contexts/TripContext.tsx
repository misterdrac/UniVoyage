import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Trip } from '@/types/trip';
import { apiService } from '@/services/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { clearTripCache } from '@/lib/tripCacheUtils';

interface TripContextType {
  trips: Trip[];
  isLoading: boolean;
  createTrip: (data: {
    destinationId: number;
    destinationName: string;
    destinationLocation: string;
    departureDate: string;
    returnDate: string;
  }) => Promise<{ success: boolean; error?: string }>;
  deleteTrip: (tripId: number) => Promise<{ success: boolean; error?: string }>;
  refreshTrips: () => Promise<void>;
  getTripById: (id: number) => Trip | undefined;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const useTrips = () => {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrips must be used within a TripProvider');
  }
  return context;
};

interface TripProviderProps {
  children: ReactNode;
}

export const TripProvider: React.FC<TripProviderProps> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const refreshTrips = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await apiService.getTrips();
      if (result.success && result.trips) {
        setTrips(result.trips as Trip[]);
      } else {
        setTrips([]);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      setTrips([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // Stable callback that doesn't depend on user

  // Load trips when user ID changes (login/logout), not on every user update
  useEffect(() => {
    if (user) {
      refreshTrips();
    } else {
      setTrips([]);
    }
  }, [user?.id, refreshTrips]); // Only depend on user ID, not the entire user object

  const createTrip = useCallback(async (data: {
    destinationId: number;
    destinationName: string;
    destinationLocation: string;
    departureDate: string;
    returnDate: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'You must be logged in to create a trip' };
    }

    setIsLoading(true);
    try {
      const result = await apiService.createTrip(data);
      if (result.success && result.trip) {
        await refreshTrips();
        toast.success(`Trip to ${data.destinationName} created successfully!`);
        return { success: true };
      } else {
        const error = result.error || 'Failed to create trip';
        toast.error(error);
        return { success: false, error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create trip';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [user, refreshTrips]);

  const deleteTrip = useCallback(async (tripId: number): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'You must be logged in to delete a trip' };
    }

    // Get trip data before deletion to clear associated cache
    const tripToDelete = trips.find(trip => trip.id === tripId);
    if (tripToDelete) {
      clearTripCache(
        tripToDelete.id,
        tripToDelete.destinationName,
        tripToDelete.destinationLocation,
        tripToDelete.departureDate,
        tripToDelete.returnDate
      );
    }

    setIsLoading(true);
    try {
      const result = await apiService.deleteTrip(tripId);
      if (result.success) {
        await refreshTrips();
        toast.success('Trip deleted successfully');
        return { success: true };
      } else {
        const error = result.error || 'Failed to delete trip';
        toast.error(error);
        return { success: false, error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete trip';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [user, refreshTrips, trips]);

  const getTripById = useCallback((id: number): Trip | undefined => {
    return trips.find(trip => trip.id === id);
  }, [trips]);

  const value: TripContextType = {
    trips,
    isLoading,
    createTrip,
    deleteTrip,
    refreshTrips,
    getTripById,
  };

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
};

