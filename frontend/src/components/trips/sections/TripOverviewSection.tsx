import { Card } from '@/components/ui/card'
import type { Trip } from '@/types/trip'
import { Clock, MapPin, Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { WeatherWidget } from '@/components/ui/weather-widget'
import { formatDateLong } from '@/lib/dateUtils'
import { useTripBudget } from '@/hooks/useTripBudget'
import { cn } from '@/lib/utils'

interface TripOverviewSectionProps {
  trip: Trip
  duration: number
  currentStatus: string
  openWeatherApiKey: string | undefined
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function TripOverviewSection({
  trip,
  duration,
  currentStatus,
  openWeatherApiKey,
}: TripOverviewSectionProps) {
  const { totalBudget, totals } = useTripBudget(trip.id)
  const remainingBudget = totalBudget - totals.actualTotal
  const budgetPercentage = totalBudget > 0 ? (totals.actualTotal / totalBudget) * 100 : 0

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <Card className={cn(
            "p-5 rounded-xl border bg-card hover:shadow-md transition-shadow",
            "sm:col-span-2 lg:col-span-1"
          )}>
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="size-5 text-primary" />
              <p className="text-sm text-muted-foreground">Budget Status</p>
            </div>
            {totalBudget > 0 ? (
              <div className="space-y-3">
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(remainingBudget)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(totals.actualTotal)} of {formatCurrency(totalBudget)} spent
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Budget Usage</span>
                    <span>{budgetPercentage.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all',
                        remainingBudget < 0 
                          ? 'bg-destructive' 
                          : budgetPercentage > 80
                          ? 'bg-orange-500'
                          : 'bg-primary'
                      )}
                      style={{
                        width: `${Math.min(budgetPercentage, 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {remainingBudget < 0 ? (
                    <>
                      <TrendingDown className="size-4 text-destructive" />
                      <span className="text-xs text-destructive font-medium">Over budget</span>
                    </>
                  ) : budgetPercentage > 80 ? (
                    <>
                      <TrendingUp className="size-4 text-orange-500" />
                      <span className="text-xs text-orange-500 font-medium">Almost spent</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="size-4 text-primary" />
                      <span className="text-xs text-muted-foreground">On track</span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-2xl font-bold text-muted-foreground">Not set</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Set your budget in the Budget section
                </p>
              </div>
            )}
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


