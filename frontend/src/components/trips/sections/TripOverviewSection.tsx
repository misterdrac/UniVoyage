import { Card } from '@/components/ui/card'
import type { Trip } from '@/types/trip'
import { Clock, MapPin } from 'lucide-react'
import { WeatherWidget } from '@/components/ui/weather-widget'
import { formatDateLong } from '@/lib/dateUtils'

interface TripOverviewSectionProps {
  trip: Trip
  duration: number
  currentStatus: string
  openWeatherApiKey: string | undefined
}

export function TripOverviewSection({
  trip,
  duration,
  currentStatus,
  openWeatherApiKey,
}: TripOverviewSectionProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-3">Trip Overview</h3>
        <p className="text-muted-foreground leading-relaxed text-base">
          This is your trip to {trip.destinationName}, {trip.destinationLocation}. Your journey begins on{' '}
          {formatDateLong(trip.departureDate)} and concludes on {formatDateLong(trip.returnDate)}.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">Quick Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-5 rounded-xl border bg-card hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="size-5 text-primary" />
              <p className="text-sm text-muted-foreground">Duration</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {duration} day{duration !== 1 ? 's' : ''}
            </p>
          </Card>
          <Card className="p-5 rounded-xl border bg-card hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="size-5 text-primary" />
              <p className="text-sm text-muted-foreground">Destination</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{trip.destinationLocation}</p>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">Weather</h3>
        {currentStatus === 'ongoing' || currentStatus === 'completed' ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Current Weather Conditions
            </p>
            <WeatherWidget
              apiKey={openWeatherApiKey}
              cityName={trip.destinationName}
              locationName={trip.destinationLocation}
              width="100%"
              animated
            />
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Weather Forecast for Your Trip</p>
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
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold text-foreground mb-3">What's Next?</h3>
        <p className="text-muted-foreground leading-relaxed text-base">
          Use the navigation tabs above to explore different sections of your trip. You can manage your budget, view
          accommodation details, discover places to visit, check the map, see weather forecasts, and plan your itinerary.
        </p>
      </div>
    </div>
  )
}


