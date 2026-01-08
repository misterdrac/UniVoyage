import { useState, useEffect, useCallback } from 'react'
import { apiService } from '@/services/api'
import type { Hotel } from '@/services/api/hotelsApi'

interface UseHotelsProps {
  city: string
  limit?: number
  enabled?: boolean
}

interface UseHotelsResult {
  hotels: Hotel[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

const CACHE_KEY_PREFIX = 'univoyage_hotels_'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours (hotel list doesn't change often)

interface CachedHotels {
  hotels: Hotel[]
  timestamp: number
}

function getCachedHotels(city: string): Hotel[] | null {
  try {
    const key = CACHE_KEY_PREFIX + city.toLowerCase().replace(/\s+/g, '-')
    const cached = localStorage.getItem(key)
    if (cached) {
      const data: CachedHotels = JSON.parse(cached)
      if (Date.now() - data.timestamp < CACHE_DURATION) {
        return data.hotels
      }
      localStorage.removeItem(key)
    }
  } catch {
    // Ignore cache errors
  }
  return null
}

function setCachedHotels(city: string, hotels: Hotel[]) {
  try {
    const key = CACHE_KEY_PREFIX + city.toLowerCase().replace(/\s+/g, '-')
    const data: CachedHotels = {
      hotels,
      timestamp: Date.now(),
    }
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // Ignore cache errors
  }
}

/**
 * Fetches hotels for a city with localStorage caching
 */
export function useHotels({ city, limit = 10, enabled = true }: UseHotelsProps): UseHotelsResult {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHotels = useCallback(async () => {
    if (!city || !enabled) return

    const cached = getCachedHotels(city)
    if (cached) {
      setHotels(cached.slice(0, limit))
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await apiService.searchHotels(city, limit)

      if (result.success && result.hotels) {
        setHotels(result.hotels)
        setCachedHotels(city, result.hotels)
      } else {
        setError(result.error || 'Failed to fetch hotels')
      }
    } catch (err: unknown) {
      setError('Failed to fetch hotel information')
    } finally {
      setIsLoading(false)
    }
  }, [city, limit, enabled])

  useEffect(() => {
    fetchHotels()
  }, [fetchHotels])

  return {
    hotels,
    isLoading,
    error,
    refetch: fetchHotels,
  }
}

