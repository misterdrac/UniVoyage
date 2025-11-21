import { useState, useCallback } from 'react';
import type { Trip } from '@/types/trip';

interface UseDeleteTripOptions {
  onSuccess?: () => void;
}

interface UseDeleteTripReturn {
  pendingDeleteTrip: Trip | null;
  isDeleting: boolean;
  deleteError: string | null;
  requestDelete: (trip: Trip) => void;
  cancelDelete: () => void;
  confirmDelete: (deleteFn: (tripId: number) => Promise<{ success: boolean; error?: string }>) => Promise<void>;
}

/**
 * Custom hook to manage trip deletion state and logic
 * Extracts common delete trip functionality to avoid duplication
 */
export function useDeleteTrip(options?: UseDeleteTripOptions): UseDeleteTripReturn {
  const { onSuccess } = options || {};
  const [pendingDeleteTrip, setPendingDeleteTrip] = useState<Trip | null>(null);
  const [deletingTripId, setDeletingTripId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const requestDelete = useCallback((trip: Trip) => {
    setPendingDeleteTrip(trip);
    setDeleteError(null);
  }, []);

  const cancelDelete = useCallback(() => {
    if (deletingTripId !== null) {
      return; // Prevent canceling while deletion is in progress
    }
    setPendingDeleteTrip(null);
    setDeleteError(null);
  }, [deletingTripId]);

  const confirmDelete = useCallback(
    async (deleteFn: (tripId: number) => Promise<{ success: boolean; error?: string }>) => {
      if (!pendingDeleteTrip) {
        return;
      }

      setDeletingTripId(pendingDeleteTrip.id);
      setDeleteError(null);

      try {
        const result = await deleteFn(pendingDeleteTrip.id);
        if (result.success) {
          setPendingDeleteTrip(null);
          setDeleteError(null);
          onSuccess?.();
        } else if (result.error) {
          setDeleteError(result.error);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete trip. Please try again.';
        setDeleteError(message);
        console.error('Error deleting trip:', error);
      } finally {
        setDeletingTripId(null);
      }
    },
    [pendingDeleteTrip, onSuccess]
  );

  return {
    pendingDeleteTrip,
    isDeleting: deletingTripId !== null,
    deleteError,
    requestDelete,
    cancelDelete,
    confirmDelete,
  };
}

