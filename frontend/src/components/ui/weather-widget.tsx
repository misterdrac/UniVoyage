import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Calendar } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { getCachedWeather, setCachedWeather } from "@/lib/weatherCache"
import type {
  WeatherWidgetProps,
  WeatherData,
  ForecastDay,
  ForecastApiResponse,
  WeatherApiResponse,
  ForecastCachePayload,
} from "./weather-widget/types"
import {
  mapWeatherType,
  formatDateTimeForTimezone,
  groupForecastByDay,
  isFinalTripDayForToday,
  getTimezoneDayNumber,
  parseTripDateToDayNumber,
} from "./weather-widget/utils"
import { WeatherSkeleton } from "./weather-widget/WeatherSkeleton"
import { TripForecastPanel } from "./weather-widget/TripForecastPanel"
import { CurrentConditionsCard } from "./weather-widget/CurrentConditionsCard"

export type {
  WeatherWidgetProps,
  WeatherData,
  ForecastDay,
  ForecastApiResponse,
  WeatherApiResponse,
} from "./weather-widget/types"

 

 

export function WeatherWidget({
  onFetchWeather,
  refreshInterval = 15 * 60 * 1000,
  width = "16rem",
  location,
  cityName,
  locationName,
  fallbackLocation,
  className = "",
  onWeatherLoaded,
  onForecastLoaded,
  onError,
  animated = true,
  forecastMode
}: WeatherWidgetProps) {
  const [weather, setWeather] = React.useState<WeatherData | null>(null)
  const [forecast, setForecast] = React.useState<ForecastDay[]>([])
  const [loading, setLoading] = React.useState<boolean>(true)
  const [initialLoad, setInitialLoad] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)
  const [locationRequested, setLocationRequested] = React.useState<boolean>(false)
  const [permissionStatus, setPermissionStatus] = React.useState<PermissionState | null>(null)
  const [isTooFarAway, setIsTooFarAway] = React.useState<boolean>(false)
  const [isFinalTripDay, setIsFinalTripDay] = React.useState<boolean>(false)

  const emitForecast = React.useCallback((days: ForecastDay[]) => {
    onForecastLoaded?.(days)
  }, [onForecastLoaded])

  const fetchWeather = React.useCallback(async (latitude?: number, longitude?: number, city?: string) => {
    setError(null)
    try {
      let weatherData: WeatherData

      if (onFetchWeather && latitude !== undefined && longitude !== undefined) {
        // Use custom fetch function if provided (requires coordinates)
        weatherData = await onFetchWeather(latitude, longitude)
      } else {
        const { apiService } = await import('@/services/api')
        let cacheKey: string
        let result: { success: boolean; weather?: WeatherData; error?: string }
        
        if (city) {
          // Use city name for API call
          const queryLocation = locationName ? `${city}, ${locationName}` : city
          cacheKey = queryLocation
          result = await apiService.getCurrentWeather(city, locationName || undefined)
        } else if (latitude !== undefined && longitude !== undefined) {
          // Use coordinates for API call
          cacheKey = `${latitude},${longitude}`
          result = await apiService.getCurrentWeatherByCoordinates(latitude, longitude)
        } else {
          throw new Error("Either coordinates or city name must be provided")
        }

        // Check cache first
        const cached = getCachedWeather(cacheKey, 'current')
        if (cached) {
          setWeather(cached)
          onWeatherLoaded?.(cached)
          setLoading(false)
          setInitialLoad(false)
          return
        }

        if (!result.success || !result.weather) {
          throw new Error(result.error || "Failed to fetch weather data")
        }

        weatherData = result.weather

        // Cache the result
        setCachedWeather(cacheKey, 'current', weatherData)
      }

      setWeather(weatherData)
      onWeatherLoaded?.(weatherData)
      
      // Announce to screen readers that weather has been updated
      const announceElement = typeof document !== 'undefined'
        ? document.getElementById('weather-update-announcement')
        : null
      if (announceElement) {
        announceElement.textContent = `Weather updated for ${weatherData.city}: ${weatherData.temperature} degrees, ${weatherData.weatherType} conditions`
      }
      
    } catch (err) {
      console.error('Error fetching weather:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }, [locationName, onFetchWeather, onWeatherLoaded, onError])

  // Fetch forecast for trip dates
  const fetchForecast = React.useCallback(async () => {
    if (!forecastMode) return

    const { cityName, locationName, departureDate, returnDate } = forecastMode

    if (isFinalTripDayForToday(returnDate)) {
      setIsFinalTripDay(true)
      setForecast([])
      emitForecast([])
      setIsTooFarAway(false)
      setError(null)
      setLoading(false)
      setInitialLoad(false)
      return
    } else {
      setIsFinalTripDay(false)
    }

    setLoading(true)
    setError(null)
    setIsTooFarAway(false)
    
    try {
      const queryLocation = locationName ? `${cityName}, ${locationName}` : cityName

      // Check cache first (use departure and return dates as part of cache key)
      const cacheKey = `${queryLocation}_${departureDate}_${returnDate}`
      const cached = getCachedWeather(cacheKey, 'forecast') as ForecastDay[] | ForecastCachePayload | null
      if (cached) {
        const cachedDays = Array.isArray(cached) ? cached : cached?.days
        const cachedTimezoneOffset = Array.isArray(cached) ? undefined : cached?.timezoneOffsetSeconds

        if (isFinalTripDayForToday(returnDate, cachedTimezoneOffset)) {
          setIsFinalTripDay(true)
          setForecast([])
          emitForecast([])
          return
        }

        if (cachedDays) {
          setIsFinalTripDay(false)
          setForecast(cachedDays)
          emitForecast(cachedDays)
          setLoading(false)
          setInitialLoad(false)
          return
        }
      }

      const { apiService } = await import('@/services/api')
      const result = await apiService.getForecast(cityName, locationName || undefined)
      
      if (!result.success || !result.forecast) {
        throw new Error(result.error || "Failed to fetch forecast data")
      }

      const data: ForecastApiResponse = result.forecast
      const timezoneOffsetSeconds = data.city?.timezone ?? 0
      const offsetMs = timezoneOffsetSeconds * 1000
      const todayDayNumber = getTimezoneDayNumber(Date.now(), offsetMs)
      const departureDayNumber = parseTripDateToDayNumber(departureDate, offsetMs)
      const daysUntilTrip = departureDayNumber - todayDayNumber
      const isOngoing = todayDayNumber >= departureDayNumber

      if (isFinalTripDayForToday(returnDate, timezoneOffsetSeconds)) {
        setIsFinalTripDay(true)
        setForecast([])
        emitForecast([])
        return
      }

      setIsFinalTripDay(false)

      if (!isOngoing && daysUntilTrip > 5) {
        setIsTooFarAway(true)
        return
      }
      
      // Group forecast by day for first 3 days (excluding today if ongoing)
      const forecastDays = groupForecastByDay(
        data.list,
        departureDate,
        isOngoing,
        timezoneOffsetSeconds,
        returnDate
      )
      
      if (forecastDays.length === 0) {
        throw new Error("No forecast data available for the trip dates")
      }

      // Cache the result
      setCachedWeather(cacheKey, 'forecast', {
        days: forecastDays,
        timezoneOffsetSeconds,
      })

      setForecast(forecastDays)
      emitForecast(forecastDays)
      setError(null)
      setIsTooFarAway(false)
    } catch (err) {
      console.error('Error fetching weather forecast:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather forecast'
      setError(errorMessage)
      setIsTooFarAway(false)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }, [forecastMode, onError, emitForecast])

  // Check permission status
  const checkPermissionStatus = React.useCallback(async () => {
    if (typeof navigator === 'undefined' || !('permissions' in navigator)) return null
    
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
      setPermissionStatus(result.state)
      return result.state
    } catch (err) {
      console.error('Error checking permission status:', err)
      return null
    }
  }, [])

  const getUserLocation = React.useCallback(async () => {
    // If city name is provided, use it directly
    if (cityName) {
      fetchWeather(undefined, undefined, cityName);
      return;
    }
    
    // If coordinates are provided, use them
    if (location) {
      fetchWeather(location.latitude, location.longitude);
      return;
    }

    // If we haven't explicitly requested location yet, don't proceed with geolocation
    if (!locationRequested && initialLoad) {
      setLoading(false);
      setError("Click 'Get Weather' to access your location");
      return;
    }

    // Check permission status if available
    const permState = await checkPermissionStatus();
    
    if (permState === 'denied') {
      // If permission is denied and we have fallback location, use it
      if (fallbackLocation) {
        fetchWeather(fallbackLocation.latitude, fallbackLocation.longitude);
        return;
      }
      
      setError("Location access denied. Please enable location services in your browser settings");
      setLoading(false);
      return;
    }

    if (typeof navigator === 'undefined') {
      const errorMessage = "Geolocation is not supported in this environment"
      setError(errorMessage)
      setLoading(false)
      setInitialLoad(false)
      onError?.(errorMessage)
      return
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          fetchWeather(position.coords.latitude, position.coords.longitude)
        },
        (geoError) => {
          let errorMessage = "Unable to retrieve your location";
          
          // Provide more specific error messages based on GeolocationPositionError
          if (geoError.code === 1) {
            // Permission denied - try fallback if available
            if (fallbackLocation) {
              fetchWeather(fallbackLocation.latitude, fallbackLocation.longitude);
              return;
            }
            errorMessage = "Location access denied. Please enable location services in your browser settings";
          } else if (geoError.code === 2) {
            errorMessage = "Location unavailable. Please try again later";
          } else if (geoError.code === 3) {
            errorMessage = "Location request timed out. Please try again";
          }
          
          setError(errorMessage)
          setLoading(false)
          setInitialLoad(false)
          onError?.(errorMessage)
        },
        { 
          enableHighAccuracy: false, 
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      const errorMessage = "Geolocation is not supported by your browser"
      setError(errorMessage)
      setLoading(false)
      setInitialLoad(false)
      onError?.(errorMessage)
    }
  }, [fetchWeather, cityName, location, fallbackLocation, onError, locationRequested, initialLoad, checkPermissionStatus]);

  const requestLocationAccess = React.useCallback(() => {
    setLocationRequested(true)
    setLoading(true)
    setError(null)
    getUserLocation()
  }, [getUserLocation])

  React.useEffect(() => {
    // If forecast mode, fetch forecast instead of current weather
    if (forecastMode) {
      fetchForecast();
      return;
    }

    // If city name is provided, fetch immediately
    if (cityName) {
      fetchWeather(undefined, undefined, cityName);
      const interval = setInterval(() => {
        fetchWeather(undefined, undefined, cityName);
      }, refreshInterval);
      return () => clearInterval(interval);
    }

    // Check permission status on component mount
    checkPermissionStatus();
    
    // Initial location fetch (won't actually request location unless we have one explicitly set)
    getUserLocation();
    
    // Only set up the refresh interval if we have explicit location or user has requested it
    if (location || locationRequested) {
      const interval = setInterval(() => {
        if (location || locationRequested) {
          getUserLocation();
        }
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [checkPermissionStatus, getUserLocation, location, cityName, locationRequested, refreshInterval, forecastMode, fetchForecast, fetchWeather]);

  return (
    <Card 
      className={`overflow-hidden rounded-xl border-none shadow-lg bg-linear-to-br from-background/90 to-muted/90 backdrop-blur ${className}`}
      style={{ width }}
      role="region"
      aria-live="polite"
      aria-atomic="true"
      aria-label="Weather information"
    >
      {/* Hidden element for screen reader announcements */}
      <div id="weather-update-announcement" className="sr-only" aria-live="assertive"></div>
      
      <CardContent className={forecastMode ? "p-6" : "p-4 text-foreground"}>
        {forecastMode ? (
          <>
            <CardHeader className="p-0 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5" />
                Weather Forecast
              </CardTitle>
            </CardHeader>
            <TripForecastPanel
              loading={loading}
              error={error}
              isTooFarAway={isTooFarAway}
              isFinalTripDay={isFinalTripDay}
              forecast={forecast}
              animated={animated}
            />
          </>
        ) : (
          // Current Weather Mode UI
          <AnimatePresence mode="wait">
            {loading ? (
            initialLoad ? (
              // Show skeleton on initial load
              <motion.div 
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <WeatherSkeleton />
              </motion.div>
            ) : (
              // Show spinner for subsequent loads
              <motion.div 
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center p-4"
                aria-label="Loading weather data"
              >
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </motion.div>
            )
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 text-center"
              role="alert"
            >
              <p className="text-sm text-destructive mb-2">{error}</p>
              
              {error.includes("Click 'Get Weather'") ? (
                <button 
                  onClick={requestLocationAccess}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 px-3 py-2"
                  aria-label="Allow location access"
                >
                  Get Weather
                </button>
              ) : (
                <>
                  <button 
                    onClick={requestLocationAccess}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-8 px-3 py-2"
                    aria-label="Refresh weather data"
                  >
                    <span>Try Again</span>
                  </button>
                  
                  {error.includes("Location access denied") && permissionStatus === 'denied' && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-2">
                        Your browser is currently blocking location access. You may need to reset permissions in your browser settings.
                      </p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ) : weather && (
            <CurrentConditionsCard weather={weather} animated={animated} />
          )}
        </AnimatePresence>
        )}
      </CardContent>
    </Card>
  )
}