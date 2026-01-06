import { useState, useEffect, useCallback } from 'react'
import { apiService } from '@/services/api'
import type { Place } from '@/services/api/placesApi'
import { getCachedPlaces, setCachedPlaces } from '@/lib/placesCache'

interface UsePointsOfInterestOptions {
  city: string
  limit?: number
  enabled?: boolean
}

interface UsePointsOfInterestReturn {
  places: Place[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Fetches points of interest for a city with caching
 */
export function usePointsOfInterest({
  city,
  limit = 10,
  enabled = true,
}: UsePointsOfInterestOptions): UsePointsOfInterestReturn {
  const [places, setPlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPlaces = useCallback(async () => {
    if (!city || !enabled) return

    // Check cache first
    const cached = getCachedPlaces(city, limit)
    if (cached) {
      setPlaces(cached)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await apiService.searchPlaces(city, limit)
      if (result.success && result.places) {
        setPlaces(result.places)
        // Cache the results
        setCachedPlaces(city, limit, result.places)
      } else {
        setError(result.error || 'Failed to load places')
        setPlaces([])
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load places')
      setPlaces([])
    } finally {
      setIsLoading(false)
    }
  }, [city, limit, enabled])

  useEffect(() => {
    fetchPlaces()
  }, [fetchPlaces])

  return {
    places,
    isLoading,
    error,
    refetch: fetchPlaces,
  }
}
