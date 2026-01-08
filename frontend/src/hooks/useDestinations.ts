import { useEffect, useState, useCallback } from 'react'
import { apiService } from '@/services/api'
import type { Destination } from '@/types/destination'

/**
 * Hook to fetch destinations from the backend API
 * Returns empty array if API call fails or no destinations are available
 */
export function useDestinations() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDestinations = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await apiService.getDestinations()
      if (result.success && result.destinations) {
        setDestinations(result.destinations)
      } else {
        const errorMsg = result.error || 'Failed to load destinations'
        console.error('Failed to fetch destinations:', errorMsg)
        setError(errorMsg)
        setDestinations([])
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load destinations'
      console.error('Error fetching destinations:', err)
      setError(errorMsg)
      setDestinations([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDestinations()
  }, [fetchDestinations])

  return {
    destinations,
    isLoading,
    error,
    refetch: fetchDestinations,
  }
}

