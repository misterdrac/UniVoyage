import { Compass } from 'lucide-react'
import { TripCard } from '@/components/trips/TripCard'
import { Button } from '@/components/ui/button'
import type { Trip } from '@/types/trip'

interface TripResultsSectionProps {
  trips: Trip[]
  deletingTripId: number | null
  hasActiveFilters: boolean
  onResetFilters: () => void
  onDeleteTrip: (trip: Trip) => void
  onViewTrip: (trip: Trip) => void
}

export function TripResultsSection({
  trips,
  deletingTripId,
  hasActiveFilters,
  onResetFilters,
  onDeleteTrip,
  onViewTrip,
}: TripResultsSectionProps) {
  if (!trips.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border/70 bg-card/60 px-8 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Compass className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">No trips match these filters</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            Try switching the status or sort order to bring back more adventures.
          </p>
        </div>
        {hasActiveFilters && (
          <Button type="button" variant="outline" onClick={onResetFilters} className="rounded-full">
            Reset filters
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip) => (
        <TripCard
          key={trip.id}
          trip={trip}
          isDeleting={deletingTripId === trip.id}
          onDelete={onDeleteTrip}
          onView={onViewTrip}
        />
      ))}
    </div>
  )
}

