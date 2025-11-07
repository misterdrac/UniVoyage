import type { MouseEvent } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { calculateTripStatus } from '@/lib/tripUtils'
import { getDestinationImageById } from '@/lib/destinationUtils'
import { formatDateShort, formatDateLong, calculateDurationInDays } from '@/lib/dateUtils'
import { getStatusConfig } from '@/lib/tripStatusUtils'
import { cn } from '@/lib/utils'
import type { Trip } from '@/types/trip'
import { Calendar, Clock, MapPin, ArrowRight, Trash2, Loader2 } from 'lucide-react'

interface TripCardProps {
  trip: Trip
  isDeleting?: boolean
  onDelete: (trip: Trip) => void
  onView: (trip: Trip) => void
}

export function TripCard({ trip, isDeleting = false, onDelete, onView }: TripCardProps) {
  const status = calculateTripStatus(trip.departureDate, trip.returnDate)
  const statusConfig = getStatusConfig(status)
  const duration = calculateDurationInDays(trip.departureDate, trip.returnDate)
  const imageUrl = getDestinationImageById(trip.destinationId)

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onDelete(trip)
  }

  const handleViewDetails = () => {
    onView(trip)
  }

  return (
    <Card
      className={cn(
        'group relative overflow-hidden border-2 transition-all duration-300',
        'hover:shadow-xl hover:scale-[1.02] hover:border-primary/30',
        'bg-card'
      )}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={trip.destinationName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />

        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border backdrop-blur-sm',
              statusConfig.bg,
              statusConfig.text,
              statusConfig.border
            )}
          >
            <span>{statusConfig.icon}</span>
            <span className="capitalize">{status}</span>
          </span>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={cn(
              'p-2 rounded-full backdrop-blur-sm transition-all',
              'text-white hover:bg-red-500/20 hover:text-red-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'border border-white/20 hover:border-red-500/30'
            )}
            aria-label={`Delete trip to ${trip.destinationName}`}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-xl font-bold text-white drop-shadow-lg">{trip.destinationName}</h3>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-sm font-medium">{trip.destinationLocation}</span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0 text-primary" />
          <div className="flex flex-col text-sm">
            <span className="font-medium">
              {formatDateShort(trip.departureDate)} - {formatDateShort(trip.returnDate)}
            </span>
            <span className="text-xs text-muted-foreground/80">{formatDateLong(trip.departureDate)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-sm">
            <span className="font-semibold text-foreground">{duration}</span> day{duration !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="border-t border-border" />

        <button
          onClick={handleViewDetails}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-4 py-2.5',
            'text-sm font-semibold rounded-lg',
            'bg-primary text-primary-foreground',
            'hover:bg-primary/90 transition-all duration-200',
            'group/btn'
          )}
        >
          <span>View Details</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
        </button>
      </CardContent>
    </Card>
  )
}



