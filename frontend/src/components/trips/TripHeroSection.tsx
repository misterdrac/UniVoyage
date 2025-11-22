import { Button } from '@/components/ui/button'
import { formatDateLong } from '@/lib/dateUtils'
import { getStatusConfig, type TripStatusConfig } from '@/lib/tripStatusUtils'
import { cn } from '@/lib/utils'
import type { Trip } from '@/types/trip'
import { ArrowLeft, Calendar, Clock, Loader2, Trash2 } from 'lucide-react'

interface TripHeroSectionProps {
  trip: Trip
  duration: number
  status: string
  statusConfig?: TripStatusConfig
  imageUrl: string
  isDeleting?: boolean
  onBack?: () => void
  onDelete?: () => void
}

export function TripHeroSection({
  trip,
  duration,
  status,
  statusConfig = getStatusConfig(status),
  imageUrl,
  isDeleting = false,
  onBack,
  onDelete,
}: TripHeroSectionProps) {
  return (
    <div className="relative w-full h-[400px] sm:h-[500px] overflow-hidden">
      <img src={imageUrl} alt={trip.destinationName} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/10 to-black/60" />

      <div className="absolute inset-0 flex items-end">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
          <div className="max-w-3xl">
            <div className="mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Trips
              </Button>
            </div>
            <div className="mb-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 drop-shadow-lg">
                {trip.destinationName}
              </h1>
              <p className="text-xl sm:text-2xl text-white/90 mb-4 drop-shadow-md">
                {trip.destinationLocation}
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap text-white/90">
              <div className="flex items-center gap-2">
                <Calendar className="size-5" />
                <span className="text-lg">
                  {formatDateLong(trip.departureDate)} - {formatDateLong(trip.returnDate)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="size-5" />
                  <span className="text-lg">{duration} day{duration !== 1 ? 's' : ''}</span>
                </div>
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
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="text-white hover:bg-red-500/20 hover:text-red-200 disabled:opacity-50"
                    aria-label="Delete trip"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


