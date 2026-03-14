import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Trip } from '@/types/trip';
import { apiService } from '@/services/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { clearTripCache } from '@/lib/tripCacheUtils';

/**
 * Trip context type
 * Provides trip data and operations for the authenticated user
 */
interface TripContextType {
  /** Array of all trips for the current user */
  trips: Trip[];
  /** Loading state for trip operations */
  isLoading: boolean;
  /** Create a new trip and return the created trip data */
  createTrip: (data: {
    destinationId: number;
    destinationName: string;
    destinationLocation: string;
    departureDate: string;
    returnDate: string;
  }) => Promise<{ success: boolean; trip?: Trip; error?: string }>;
  /** Delete a trip by ID */
  deleteTrip: (tripId: number) => Promise<{ success: boolean; error?: string }>;
  /** Refresh trips list from server */
  refreshTrips: () => Promise<void>;
  /** Get a trip by ID from the current trips list */
  getTripById: (id: number) => Trip | undefined;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

/**
 * Hook to access trip context
 * @returns TripContextType with trips data and operations
 * @throws Error if used outside of TripProvider
 */
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

/**
 * Context provider for trip management
 * Manages user trips, creation, deletion, and automatic refresh on user login/logout
 * Automatically loads trips when user logs in and clears trips on logout
 * 
 * @example
 * ```tsx
 * <TripProvider>
 *   <App />
 * </TripProvider>
 * ```
 */
export const TripProvider: React.FC<TripProviderProps> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  /**
   * Refreshes trips list from the server
   * Updates local trips state with latest data
   */
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

  /**
   * Creates a new trip for the authenticated user
   * Automatically refreshes trips list after successful creation
   * @param data - Trip creation data
   * @returns Promise resolving to success status and optional error message
   */
  const createTrip = useCallback(async (data: {
    destinationId: number;
    destinationName: string;
    destinationLocation: string;
    departureDate: string;
    returnDate: string;
  }): Promise<{ success: boolean; trip?: Trip; error?: string }> => {
    if (!user) {
      return { success: false, error: 'You must be logged in to create a trip' };
    }

    setIsLoading(true);
    try {
      const result = await apiService.createTrip(data);
      if (result.success && result.trip) {
        await refreshTrips();
        toast.success(`Trip to ${data.destinationName} created successfully!`);
        return { success: true, trip: result.trip as Trip };
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

  /**
   * Deletes a trip by ID
   * Clears associated cache and refreshes trips list after successful deletion
   * @param tripId - ID of the trip to delete
   * @returns Promise resolving to success status and optional error message
   */
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

  /**
   * Gets a trip by ID from the current trips list
   * @param id - Trip ID to search for
   * @returns Trip object if found, undefined otherwise
   */
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

