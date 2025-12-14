import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Star, ExternalLink } from 'lucide-react'
import type { Trip } from '@/types/trip'
import { getPointsOfInterestForCity, type PointOfInterest } from '@/data/pointsOfInterest'
import { cn } from '@/lib/utils'

interface TripPointsOfInterestSectionProps {
  trip: Trip
}

export function TripPointsOfInterestSection({ trip }: TripPointsOfInterestSectionProps) {
  const pointsOfInterest = useMemo(() => {
    const cityName = trip.destinationName || trip.destinationLocation
    return getPointsOfInterestForCity(cityName)
  }, [trip.destinationName, trip.destinationLocation])

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Landmark': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Museum': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Park': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Religious Site': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      'Neighborhood': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Beach': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      'Market': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Entertainment': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Activity': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'Street': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      'Shopping & Dining': 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
    }
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  }

  const getCategoryBorderColor = (category: string): string => {
    const borderColors: Record<string, string> = {
      'Landmark': 'border-blue-500',
      'Museum': 'border-purple-500',
      'Park': 'border-green-500',
      'Religious Site': 'border-amber-500',
      'Neighborhood': 'border-pink-500',
      'Beach': 'border-cyan-500',
      'Market': 'border-orange-500',
      'Entertainment': 'border-red-500',
      'Activity': 'border-indigo-500',
      'Street': 'border-gray-500',
      'Shopping & Dining': 'border-rose-500'
    }
    return borderColors[category] || 'border-gray-500'
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Points of Interest in {trip.destinationName || trip.destinationLocation}
        </h3>
        <p className="text-sm text-muted-foreground">
          Discover interesting places to visit during your trip
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pointsOfInterest.map((poi) => (
          <Card
            key={poi.id}
            className={cn(
              'overflow-hidden border-2 transition-all duration-300',
              'hover:shadow-lg hover:shadow-primary/5 hover:scale-[1.02]',
              'bg-card',
              getCategoryBorderColor(poi.category)
            )}
          >
            <CardContent className="p-5">
              {/* Header with title and category */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-foreground mb-2">
                    {poi.name}
                  </h4>
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-md font-medium inline-block',
                    getCategoryColor(poi.category)
                  )}>
                    {poi.category}
                  </span>
                </div>
                
                {/* Rating */}
                {poi.rating && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-foreground">
                      {poi.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {poi.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {poi.description}
                </p>
              )}

              {/* Address */}
              <div className="flex items-start gap-2 text-xs text-muted-foreground mb-4">
                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
                <span className="line-clamp-2 flex-1">{poi.address}</span>
              </div>

              {/* Website link */}
              {poi.website && (
                <a
                  href={poi.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Visit website
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-4 border-t">
        <p className="text-xs text-muted-foreground text-center">
          💡 Points of interest are curated for popular destinations. More locations coming soon!
        </p>
      </div>
    </div>
  )
}

