/**
 * Utility functions to clear trip-related cache data when a trip is deleted
 */

import { clearPlacesCacheForCity } from './placesCache'

// Cache key prefixes
const PACKING_SUGGESTIONS_PREFIX = 'packing-suggestions-'
const PACKING_STATE_PREFIX = 'packing-'
const ITINERARY_PREFIX = 'trip-itinerary-'
const TRIP_BUDGET_PREFIX = 'trip-budget-'
const BUDGET_ESTIMATE_PREFIX = 'budget-estimate-'

/**
 * Clear packing suggestions cache for a specific trip
 */
export const clearPackingSuggestionsCache = (tripId: number): void => {
  try {
    if (typeof window === 'undefined') return
    const storageKey = `${PACKING_SUGGESTIONS_PREFIX}${tripId}`
    localStorage.removeItem(storageKey)
  } catch (error) {
    console.error('Error clearing packing suggestions cache:', error)
  }
}

/**
 * Clear packing item state (checked items) for a specific trip
 */
export const clearPackingState = (tripId: number): void => {
  try {
    if (typeof window === 'undefined') return
    const storageKey = `${PACKING_STATE_PREFIX}${tripId}`
    localStorage.removeItem(storageKey)
  } catch (error) {
    console.error('Error clearing packing state:', error)
  }
}

/**
 * Clear itinerary plan cache for a specific trip
 */
export const clearItineraryPlanCache = (tripId: number): void => {
  try {
    if (typeof window === 'undefined') return
    const storageKey = `${ITINERARY_PREFIX}${tripId}`
    localStorage.removeItem(storageKey)
  } catch (error) {
    console.error('Error clearing itinerary cache:', error)
  }
}

/**
 * Clear budget estimate cache for a specific trip
 */
export const clearBudgetEstimateCache = (tripId: number): void => {
  try {
    if (typeof window === 'undefined') return
    const storageKey = `${BUDGET_ESTIMATE_PREFIX}${tripId}`
    localStorage.removeItem(storageKey)
  } catch (error) {
    console.error('Error clearing budget estimate cache:', error)
  }
}

/**
 * Clear weather forecast cache for a specific trip
 * The cache key format is: `${cityName}, ${locationName}_${departureDate}_${returnDate}`
 * or `${cityName}_${departureDate}_${returnDate}` if locationName is not provided or empty
 */
export const clearWeatherForecastCache = (
  cityName: string,
  locationName: string | undefined,
  departureDate: string,
  returnDate: string
): void => {
  try {
    if (typeof window === 'undefined') return
    
    // Construct the cache key the same way it's done in weather-widget.tsx
    // locationName can be undefined, null, or empty string - all should be treated as falsy
    const queryLocation = locationName?.trim() ? `${cityName}, ${locationName}` : cityName
    const cacheKey = `${queryLocation}_${departureDate}_${returnDate}`
    
    // Weather cache uses the format: weather_cache_forecast_${location.toLowerCase().replace(/\s+/g, '_')}
    // The getCachedWeather function normalizes the location the same way
    const normalizedLocation = cacheKey.toLowerCase().replace(/\s+/g, '_')
    const weatherCacheKey = `weather_cache_forecast_${normalizedLocation}`
    
    localStorage.removeItem(weatherCacheKey)
  } catch (error) {
    console.error('Error clearing weather forecast cache:', error)
  }
}

/**
 * Clear POI cache for a specific city
 */
export const clearPlacesCache = (cityName: string): void => {
  try {
    if (typeof window === 'undefined') return
    clearPlacesCacheForCity(cityName)
  } catch (error) {
    console.error('Error clearing POI cache:', error)
  }
}

/**
 * Clear all cache data associated with a trip
 */
export const clearTripCache = (
  tripId: number,
  cityName: string,
  locationName: string | undefined,
  departureDate: string,
  returnDate: string
): void => {
  clearPackingSuggestionsCache(tripId)
  clearPackingState(tripId)
  clearItineraryPlanCache(tripId)
  clearBudgetEstimateCache(tripId)
  clearWeatherForecastCache(cityName, locationName, departureDate, returnDate)
  // Clear POI cache for the destination city
  clearPlacesCache(cityName)
  // Also clear for locationName if it's different from cityName
  if (locationName && locationName.trim() && locationName !== cityName) {
    clearPlacesCache(locationName)
  }
}

/**
 * Clear all trip budget data from localStorage
 */
export const clearAllTripBudgets = (): void => {
  try {
    if (typeof window === 'undefined') return
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(TRIP_BUDGET_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch (error) {
    console.error('Error clearing all trip budgets:', error)
  }
}

/**
 * Clear all packing-related data from localStorage
 * This includes both packing suggestions and checklist state (all keys starting with 'packing-')
 */
export const clearAllPackingLocalStorage = (): void => {
  try {
    if (typeof window === 'undefined') return
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(PACKING_STATE_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch (error) {
    console.error('Error clearing all packing data:', error)
  }
}

/**
 * Clear all itinerary cache from localStorage
 */
export const clearAllItineraries = (): void => {
  try {
    if (typeof window === 'undefined') return
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(ITINERARY_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch (error) {
    console.error('Error clearing all itineraries:', error)
  }
}

/**
 * Clear all budget estimate data from localStorage
 */
export const clearAllBudgetEstimates = (): void => {
  try {
    if (typeof window === 'undefined') return
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(BUDGET_ESTIMATE_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch (error) {
    console.error('Error clearing all budget estimates:', error)
  }
}

/**
 * Clear all trip-related data from localStorage
 * This includes budgets, itineraries, packing suggestions, and budget estimates
 */
export const clearAllTripData = (): void => {
  clearAllTripBudgets()
  clearAllItineraries()
  clearAllPackingLocalStorage()
  clearAllBudgetEstimates()
}

