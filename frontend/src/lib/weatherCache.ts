/**
 * Weather data cache utility
 * Caches weather data in localStorage with expiration to avoid unnecessary API calls
 */

interface CachedWeatherData {
  data: any
  timestamp: number
  expiresAt: number
}

const CACHE_PREFIX = 'weather_cache_'
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes in milliseconds

/**
 * Generate a cache key from location and type
 */
const getCacheKey = (location: string, type: 'current' | 'forecast'): string => {
  return `${CACHE_PREFIX}${type}_${location.toLowerCase().replace(/\s+/g, '_')}`
}

/**
 * Get cached weather data if it exists and hasn't expired
 */
export const getCachedWeather = (location: string, type: 'current' | 'forecast'): any | null => {
  try {
    const cacheKey = getCacheKey(location, type)
    const cached = localStorage.getItem(cacheKey)
    
    if (!cached) return null
    
    const { data, expiresAt }: CachedWeatherData = JSON.parse(cached)
    const now = Date.now()
    
    // Check if cache has expired
    if (now > expiresAt) {
      localStorage.removeItem(cacheKey)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error reading weather cache:', error)
    return null
  }
}

/**
 * Cache weather data with expiration timestamp
 */
export const setCachedWeather = (
  location: string, 
  type: 'current' | 'forecast', 
  data: any,
  duration: number = CACHE_DURATION
): void => {
  try {
    const cacheKey = getCacheKey(location, type)
    const now = Date.now()
    const expiresAt = now + duration
    
    const cacheData: CachedWeatherData = {
      data,
      timestamp: now,
      expiresAt
    }
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
  } catch (error) {
    console.error('Error caching weather data:', error)
    // If storage is full, try to clear old entries
    clearExpiredCache()
  }
}

/**
 * Clear expired cache entries
 */
export const clearExpiredCache = (): void => {
  try {
    const now = Date.now()
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key)
          if (cached) {
            const { expiresAt }: CachedWeatherData = JSON.parse(cached)
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
    console.error('Error clearing expired cache:', error)
  }
}

/**
 * Clear all weather cache
 */
export const clearAllWeatherCache = (): void => {
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
    console.error('Error clearing all weather cache:', error)
  }
}

