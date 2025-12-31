/**
 * Points of Interest cache utility
 * Caches POI data in localStorage with expiration to avoid unnecessary API calls
 */

import type { Place } from '@/services/api/placesApi'

interface CachedPlacesData {
  data: Place[]
  timestamp: number
  expiresAt: number
}

const CACHE_PREFIX = 'poi_cache_'
const CACHE_DURATION = 14 * 24 * 60 * 60 * 1000 // 14 days in milliseconds

/**
 * Generate a cache key from city name and limit
 */
const getCacheKey = (city: string, limit: number): string => {
  return `${CACHE_PREFIX}${city.toLowerCase().replace(/\s+/g, '_')}_${limit}`
}

/**
 * Get cached POI data if it exists and hasn't expired
 */
export const getCachedPlaces = (city: string, limit: number): Place[] | null => {
  try {
    const cacheKey = getCacheKey(city, limit)
    const cached = localStorage.getItem(cacheKey)
    
    if (!cached) return null
    
    const { data, expiresAt }: CachedPlacesData = JSON.parse(cached)
    const now = Date.now()
    
    // Check if cache has expired
    if (now > expiresAt) {
      localStorage.removeItem(cacheKey)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error reading POI cache:', error)
    return null
  }
}

/**
 * Cache POI data with expiration timestamp
 */
export const setCachedPlaces = (
  city: string,
  limit: number,
  data: Place[],
  duration: number = CACHE_DURATION
): void => {
  try {
    const cacheKey = getCacheKey(city, limit)
    const now = Date.now()
    const expiresAt = now + duration
    
    const cacheData: CachedPlacesData = {
      data,
      timestamp: now,
      expiresAt
    }
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
  } catch (error) {
    console.error('Error caching POI data:', error)
    // If storage is full, try to clear old entries
    clearExpiredPlacesCache()
  }
}

/**
 * Clear POI cache for a specific city
 */
export const clearPlacesCacheForCity = (city: string): void => {
  try {
    const cityKey = city.toLowerCase().replace(/\s+/g, '_')
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(CACHE_PREFIX) && key.includes(cityKey)) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch (error) {
    console.error('Error clearing POI cache for city:', error)
  }
}

/**
 * Clear expired cache entries
 */
export const clearExpiredPlacesCache = (): void => {
  try {
    const now = Date.now()
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key)
          if (cached) {
            const { expiresAt }: CachedPlacesData = JSON.parse(cached)
            if (now > expiresAt) {
              keysToRemove.push(key)
            }
          }
        } catch {
          // Invalid cache entry, remove it
          keysToRemove.push(key)
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch (error) {
    console.error('Error clearing expired POI cache:', error)
  }
}

/**
 * Clear all POI cache
 */
export const clearAllPlacesCache = (): void => {
  try {
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch (error) {
    console.error('Error clearing all POI cache:', error)
  }
}

