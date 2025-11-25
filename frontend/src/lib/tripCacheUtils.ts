/**
 * Utility functions to clear trip-related cache data when a trip is deleted
 */

/**
 * Clear packing suggestions cache for a specific trip
 */
export const clearPackingSuggestionsCache = (tripId: number): void => {
  try {
    if (typeof window === 'undefined') return
    const storageKey = `packing-suggestions-${tripId}`
    localStorage.removeItem(storageKey)
  } catch (error) {
    console.error('Error clearing packing suggestions cache:', error)
  }
}

/**
 * Clear itinerary plan cache for a specific trip
 */
export const clearItineraryPlanCache = (tripId: number): void => {
  try {
    if (typeof window === 'undefined') return
    const storageKey = `trip-itinerary-${tripId}`
    localStorage.removeItem(storageKey)
  } catch (error) {
    console.error('Error clearing itinerary cache:', error)
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
  clearItineraryPlanCache(tripId)
  clearWeatherForecastCache(cityName, locationName, departureDate, returnDate)
}

