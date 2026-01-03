import { Card } from '@/components/ui/card'
import type { Trip } from '@/types/trip'
import { Clock, MapPin, Wallet, TrendingUp, TrendingDown, Hotel, Building2, Phone } from 'lucide-react'
import { WeatherWidget } from '@/components/ui/weather-widget'
import { formatDateLong } from '@/lib/dateUtils'
import { useTripBudget } from '@/hooks/useTripBudget'
import { apiService } from '@/services/api'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface TripOverviewSectionProps {
  trip: Trip
  duration: number
  currentStatus: string
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function TripOverviewSection({
  trip,
  duration,
  currentStatus,
}: TripOverviewSectionProps) {
  const { totalBudget, totals } = useTripBudget(trip.id)
  const [accommodation, setAccommodation] = useState<{
    accommodationName?: string
    accommodationAddress?: string
    accommodationPhone?: string
  } | null>(null)

  const remainingBudget = totalBudget - totals.actualTotal
  const budgetPercentage = totalBudget > 0 ? (totals.actualTotal / totalBudget) * 100 : 0

  // Load accommodation data
  useEffect(() => {
    let isMounted = true

    const loadAccommodation = async () => {
      try {
        const result = await apiService.getTripAccommodation(trip.id)
        if (isMounted && result.success && result.accommodation) {
          setAccommodation(result.accommodation)
        }
      } catch (err) {
        console.error('Failed to load accommodation:', err)
      }
    }

    loadAccommodation()

    return () => {
      isMounted = false
    }
  }, [trip.id])

  const hasAccommodation = accommodation && (accommodation.accommodationName || accommodation.accommodationAddress || accommodation.accommodationPhone)

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
        <div className="space-y-4">
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
          <Card className="p-5 rounded-xl border bg-card hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <Hotel className="size-5 text-primary" />
              <p className="text-sm text-muted-foreground">Accommodation</p>
            </div>
            {hasAccommodation ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                  <div className="shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <Building2 className="size-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Name</p>
                    <p className={cn(
                      "text-sm font-semibold text-foreground line-clamp-2",
                      !accommodation?.accommodationName && "text-muted-foreground font-normal"
                    )}>
                      {accommodation?.accommodationName || "Not set"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                    <div className="shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                      <MapPin className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Address</p>
                      <p className={cn(
                        "text-sm text-foreground line-clamp-2",
                        !accommodation?.accommodationAddress && "text-muted-foreground"
                      )}>
                        {accommodation?.accommodationAddress || "Not set"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                    <div className="shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                      <Phone className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Phone</p>
                      <p className={cn(
                        "text-sm text-foreground",
                        !accommodation?.accommodationPhone && "text-muted-foreground"
                      )}>
                        {accommodation?.accommodationPhone || "Not set"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  No accommodation details saved yet
                </p>
                <p className="text-xs text-muted-foreground/80">
                  Add your booking details in the Accommodation section
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">Budget Status</h3>
        <Card className="p-5 rounded-xl border bg-card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="size-5 text-primary" />
            <p className="text-sm text-muted-foreground">Current Budget Overview</p>
          </div>
          {totalBudget > 0 ? (
            <div className="space-y-4">
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

      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">Weather</h3>
        {currentStatus === 'ongoing' || currentStatus === 'completed' ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Current Weather Conditions
            </p>
            <WeatherWidget
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


