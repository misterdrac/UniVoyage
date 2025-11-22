import { Card, CardContent } from '@/components/ui/card'
import { WeatherWidget } from '@/components/ui/weather-widget'
import type { Trip } from '@/types/trip'

interface TripWeatherSectionProps {
  trip: Trip
  currentStatus: string
  openWeatherApiKey: string | undefined
}

export function TripWeatherSection({ trip, currentStatus, openWeatherApiKey }: TripWeatherSectionProps) {
  return (
    <div className="space-y-6">
      {currentStatus === 'ongoing' ? (
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-2">Current Weather</h4>
            <WeatherWidget
              apiKey={openWeatherApiKey}
              cityName={trip.destinationName}
              locationName={trip.destinationLocation}
              width="100%"
              animated
            />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-2">Remaining Trip Forecast</h4>
            <WeatherWidget
              apiKey={openWeatherApiKey}
              forecastMode={{
                cityName: trip.destinationName,
                locationName: trip.destinationLocation,
                departureDate: trip.departureDate,
                returnDate: trip.returnDate,
              }}
              width="100%"
              animated
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-2">Trip Forecast</h4>
            <WeatherWidget
              apiKey={openWeatherApiKey}
              forecastMode={{
                cityName: trip.destinationName,
                locationName: trip.destinationLocation,
                departureDate: trip.departureDate,
                returnDate: trip.returnDate,
              }}
              width="100%"
              animated
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
          <Card className="p-6 border-2 border-dashed bg-muted/30">
            <CardContent className="p-0 space-y-3">
              <h4 className="text-base font-semibold text-foreground">Coming Soon</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Hourly forecast for the next 24-48 hours</li>
                <li>Extended forecast for the full trip duration</li>
                <li>Detailed weather metrics (humidity, wind speed, UV index)</li>
                <li>Weather alerts and warnings</li>
                <li>Packing suggestions based on forecast</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}


