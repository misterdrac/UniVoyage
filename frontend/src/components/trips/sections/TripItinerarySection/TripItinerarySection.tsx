import { AlertCircle, CalendarDays, Loader2, MapPin, RefreshCw, Sparkles } from 'lucide-react'
import { formatDateLong } from '@/lib/dateUtils'
import type { Trip } from '@/types/trip'
import type { TripStatus } from '@/lib/tripStatusUtils'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTripItinerary } from './useTripItinerary'
import { ItineraryTimeline } from './ItineraryTimeline'
import { ItineraryLoader } from './ItineraryLoader'
import { RawItineraryDebug } from './RawItineraryDebug'

interface TripItinerarySectionProps {
  trip: Trip
  currentStatus: TripStatus
}

export function TripItinerarySection(props: TripItinerarySectionProps) {
  const {
    structuredItinerary,
    rawItinerary,
    error,
    isLoading,
    loadingMessage,
    locationLabel,
    durationInDays,
    hasExistingPlan,
    hasStalePlan,
    canRefreshPlan,
    isTripPlanned,
    generateItinerary,
  } = useTripItinerary(props)
  const tripDateRange = `${formatDateLong(props.trip.departureDate)} – ${formatDateLong(props.trip.returnDate)}`

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card/60 p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            {locationLabel}
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            {tripDateRange}
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Plan your days with an AI-powered itinerary tailored to your interests.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {hasStalePlan && (
        <div className="rounded-xl border border-info/30 bg-info/5 p-3 text-xs text-info">
          Properties of the trip changed since this itinerary was generated.
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          {canRefreshPlan
            ? 'Looks like your interests shifted—refresh to realign the flow.'
            : hasStalePlan && !isTripPlanned
            ? 'Trip underway or completed, cannot refresh itinerary.'
            : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {!hasExistingPlan && isTripPlanned && (
            <Button
              onClick={generateItinerary}
              disabled={isLoading}
              className={cn('flex items-center gap-2', isLoading && 'cursor-not-allowed opacity-80')}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Crafting your plan…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate itinerary
                </>
              )}
            </Button>
          )}
          {!isTripPlanned && (
            <p className="text-xs text-muted-foreground">
              Itinerary generation is available only before the trip begins.
            </p>
          )}
          {canRefreshPlan && (
            <Button
              onClick={generateItinerary}
              disabled={isLoading}
              className={cn('flex items-center gap-2', isLoading && 'cursor-not-allowed opacity-80')}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Crafting your plan…
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Refresh itinerary
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {isLoading && <ItineraryLoader message={loadingMessage} />}

      {structuredItinerary && (
        <ItineraryTimeline
          itinerary={structuredItinerary}
          durationInDays={durationInDays}
          locationLabel={locationLabel}
        />
      )}

      {!structuredItinerary && rawItinerary && <RawItineraryDebug raw={rawItinerary} />}

      {!hasExistingPlan && !isLoading && (
        <div className="rounded-2xl border border-dashed bg-muted/20 p-6 text-center">
          <Sparkles className="mx-auto h-5 w-5 text-primary" />
          <p className="mt-3 text-sm font-semibold text-foreground">No plan yet—let’s storyboard it.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Once generated, you’ll get a cinematic timeline full of standout meals, mindful pauses, and night stories.
          </p>
        </div>
      )}
    </div>
  )
}

