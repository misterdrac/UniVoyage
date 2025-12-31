import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { WeatherWidget } from '@/components/ui/weather-widget'
import type { ForecastDay } from '@/components/ui/weather-widget'
import type { Trip } from '@/types/trip'
import type { TripStatus } from '@/lib/tripStatusUtils'
import { PackingSuggestionsSection } from './PackingSuggestionsSection'

interface TripWeatherSectionProps {
  trip: Trip
  currentStatus: TripStatus
}

export function TripWeatherSection({ trip, currentStatus }: TripWeatherSectionProps) {
  const isOngoing = currentStatus === 'ongoing'
  const isCompleted = currentStatus === 'completed'
  const isPlanned = currentStatus === 'planned'
  const showCurrentWeather = isOngoing || isCompleted

  const [packingForecast, setPackingForecast] = useState<ForecastDay[] | null>(null)

  const forecastMode = useMemo(() => ({
    cityName: trip.destinationName,
    locationName: trip.destinationLocation,
    departureDate: trip.departureDate,
    returnDate: trip.returnDate,
  }), [trip.destinationName, trip.destinationLocation, trip.departureDate, trip.returnDate])

  const widgetBaseProps = {
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
                onForecastLoaded={setPackingForecast}
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
              onForecastLoaded={setPackingForecast}
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

      <PackingSuggestionsSection
        tripId={trip.id}
        destinationName={trip.destinationName}
        departureDate={trip.departureDate}
        returnDate={trip.returnDate}
        forecast={packingForecast}
        currentStatus={currentStatus}
      />
    </div>
  )
}


