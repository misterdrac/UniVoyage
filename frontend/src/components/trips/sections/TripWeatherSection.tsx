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
  const isOngoing = currentStatus === 'ongoing'
  const isCompleted = currentStatus === 'completed'
  const isPlanned = currentStatus === 'planned'
  const showCurrentWeather = isOngoing || isCompleted

  const forecastMode = {
    cityName: trip.destinationName,
    locationName: trip.destinationLocation,
    departureDate: trip.departureDate,
    returnDate: trip.returnDate,
  }

  if (!openWeatherApiKey) {
    return (
      <Card className="p-6 border-2 border-dashed">
        <CardContent className="p-0">
          <p className="text-sm text-muted-foreground text-center">
            Weather data is currently unavailable. Add an OpenWeather API key to enable live trip forecasts.
          </p>
        </CardContent>
      </Card>
    )
  }

  const widgetBaseProps = {
    apiKey: openWeatherApiKey,
    width: "100%" as const,
    animated: true,
  }

  return (
    <div className="space-y-6">
      {showCurrentWeather && (
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Current weather conditions
            </h4>
            <WeatherWidget
              {...widgetBaseProps}
              cityName={trip.destinationName}
              locationName={trip.destinationLocation}
            />
          </div>
          {isOngoing && (
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Forecast for the following days</h4>
              <WeatherWidget
                {...widgetBaseProps}
                forecastMode={forecastMode}
              />
            </div>
          )}
        </div>
      )}

      {isPlanned && (
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-2">Trip Forecast</h4>
            <WeatherWidget
              {...widgetBaseProps}
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


