import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { WeatherWidget } from '@/components/ui/weather-widget'
import type { Trip } from '@/types/trip'
import type { TripStatus } from '@/lib/tripStatusUtils'

interface TripWeatherSectionProps {
  trip: Trip
  currentStatus: TripStatus
  openWeatherApiKey: string | undefined
}

export function TripWeatherSection({ trip, currentStatus, openWeatherApiKey }: TripWeatherSectionProps) {
  // Memoize derived status checks to avoid recalculation
  const statusChecks = useMemo(() => ({
    isOngoingOrCompleted: currentStatus === 'ongoing' || currentStatus === 'completed',
    isOngoing: currentStatus === 'ongoing',
    isPlanned: currentStatus === 'planned',
  }), [currentStatus])

  // Memoize common widget props to avoid recreating object on every render
  const commonWidgetProps = useMemo(() => ({
    apiKey: openWeatherApiKey,
    width: "100%" as const,
    animated: true,
  }), [openWeatherApiKey])

  // Memoize forecast mode configuration to avoid recreating object on every render
  const forecastMode = useMemo(() => ({
    cityName: trip.destinationName,
    locationName: trip.destinationLocation,
    departureDate: trip.departureDate,
    returnDate: trip.returnDate,
  }), [trip.destinationName, trip.destinationLocation, trip.departureDate, trip.returnDate])

  return (
    <div className="space-y-6">
      {statusChecks.isOngoingOrCompleted && (
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Current weather conditions
            </h4>
            <WeatherWidget
              {...commonWidgetProps}
              cityName={trip.destinationName}
              locationName={trip.destinationLocation}
            />
          </div>
          {statusChecks.isOngoing && (
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Forecast for the following days</h4>
              <WeatherWidget
                {...commonWidgetProps}
                forecastMode={forecastMode}
              />
            </div>
          )}
        </div>
      )}

      {statusChecks.isPlanned && (
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-2">Trip Forecast</h4>
            <WeatherWidget
              {...commonWidgetProps}
              forecastMode={forecastMode}
            />
          </div>
          <Card className="p-6 border-2 border-dashed">
            <CardContent className="p-0">
              <p className="text-sm text-muted-foreground text-center">
                💡 <strong>Tip:</strong> Weather forecasts are most accurate within 5 days. Check back closer to your trip for
                the most up-to-date information.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}


