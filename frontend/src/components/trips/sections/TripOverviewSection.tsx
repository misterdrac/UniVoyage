import { Card } from '@/components/ui/card'
import type { Trip } from '@/types/trip'
import { Clock, MapPin, Wallet, TrendingUp, TrendingDown, Hotel, Building2, Phone } from 'lucide-react'
import { WeatherWidget } from '@/components/ui/weather-widget'
import { formatDateLong } from '@/lib/dateUtils'
import { useTripBudget } from '@/hooks/useTripBudget'
import { apiService } from '@/services/api'
import { cn } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'
import { TripRatingSection } from '@/components/trips/sections/TripRatingSection'

interface TripOverviewSectionProps {
  trip: Trip
  duration: number
  currentStatus: string
}

interface CountdownState {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const ZERO_COUNTDOWN: CountdownState = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
}

const getCountdownToDepartureStart = (departureDate: string): CountdownState => {
  const now = new Date()
  const departureStart = new Date(departureDate)
  departureStart.setHours(0, 0, 0, 0)

  const diffMs = departureStart.getTime() - now.getTime()
  if (diffMs <= 0) {
    return ZERO_COUNTDOWN
  }

  const totalSeconds = Math.floor(diffMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds }
}

const formatCountdownUnit = (value: number): string => value.toString().padStart(2, '0')

function DepartureCountdownCard({ departureDate }: { departureDate: string }) {
  const [countdown, setCountdown] = useState<CountdownState>(() =>
    getCountdownToDepartureStart(departureDate)
  )

  useEffect(() => {
    setCountdown(getCountdownToDepartureStart(departureDate))

    const intervalId = window.setInterval(() => {
      setCountdown(getCountdownToDepartureStart(departureDate))
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [departureDate])

  return (
    <Card className="p-5 rounded-xl border bg-card hover:shadow-md transition-shadow">
      <div className="mb-4">
        <h4 className="text-base sm:text-lg lg:text-xl font-semibold text-foreground leading-tight wrap-break-word">
          Countdown To Departure Day
        </h4>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Time remaining until your trip officially starts
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border/50 bg-muted/50 p-3 text-center">
          <p className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">{countdown.days}</p>
          <p className="text-xs text-muted-foreground mt-1">Days</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-muted/50 p-3 text-center">
          <p className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
            {formatCountdownUnit(countdown.hours)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Hours</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-muted/50 p-3 text-center">
          <p className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
            {formatCountdownUnit(countdown.minutes)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Minutes</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-muted/50 p-3 text-center">
          <p className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
            {formatCountdownUnit(countdown.seconds)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Seconds</p>
        </div>
      </div>
    </Card>
  )
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
  const forecastMode = useMemo(
    () => ({
      cityName: trip.destinationName,
      locationName: trip.destinationLocation,
      departureDate: trip.departureDate,
      returnDate: trip.returnDate,
    }),
    [trip.destinationName, trip.destinationLocation, trip.departureDate, trip.returnDate]
  )
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
          {currentStatus === 'planned' && <DepartureCountdownCard departureDate={trip.departureDate} />}

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
                        ? 'bg-(--profile-stat-amber)'
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
                    <TrendingUp className="size-4 var(--profile-stat-amber)" />
                    <span className="text-xs var(--profile-stat-amber) font-medium">Almost spent</span>
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
            <WeatherWidget forecastMode={forecastMode} width="100%" animated />
          </div>
        )}
      </div>

      {/* Rating section — only shown after trip is completed */}
      {currentStatus === 'completed' && (
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-4">Rate Your Trip</h3>
          <TripRatingSection tripId={trip.id} destinationName={trip.destinationName} />
        </div>
      )}

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


