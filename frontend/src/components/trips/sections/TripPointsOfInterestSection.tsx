import { Card, CardContent } from '@/components/ui/card'
import { MapPin, ExternalLink, Loader2, AlertCircle, RefreshCw, Globe, BookOpen, Landmark, Camera, Compass, ChevronDown, Church, TreePine, TowerControl, Square, Flower2, Star, Palette, Shield, Castle, Amphora, BrickWall, University } from 'lucide-react'
import type { Trip } from '@/types/trip'
import { usePointsOfInterest } from '@/hooks/usePointsOfInterest'
import { usePaginatedItems } from '@/hooks/usePaginatedItems'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

interface TripPointsOfInterestSectionProps {
  trip: Trip
}

function LoadingState({ cityName }: { cityName: string }) {
  const icons = [
    { Icon: MapPin, label: 'Finding locations' },
    { Icon: Landmark, label: 'Discovering landmarks' },
    { Icon: Camera, label: 'Exploring attractions' },
    { Icon: Compass, label: 'Mapping points of interest' },
  ] as const
  
  const [currentIconIndex, setCurrentIconIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIconIndex((prev) => (prev + 1) % icons.length)
    }, 1500)

    return () => clearInterval(interval)
  }, [icons.length])

  const { label } = icons[currentIconIndex]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Points of Interest in {cityName}
        </h3>
        <p className="text-sm text-muted-foreground">
          Discover interesting places to visit during your trip
        </p>
      </div>
      <Card className="border-2 border-dashed">
        <CardContent className="py-16">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative h-20 w-20">
              {icons.map(({ Icon: IconComponent }, index) => (
                <div
                  key={index}
                  className={cn(
                    'absolute inset-0 flex items-center justify-center transition-all duration-500',
                    index === currentIconIndex
                      ? 'opacity-100 scale-100 rotate-0'
                      : 'opacity-0 scale-75 rotate-12'
                  )}
                >
                  <IconComponent className="h-12 w-12 text-primary animate-pulse" />
                </div>
              ))}
            </div>

            <div className="text-center space-y-2">
              <p className="text-lg font-medium text-foreground animate-pulse">
                {label}...
              </p>
              <div className="flex items-center justify-center gap-1">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Please wait while we gather the best places to visit
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {icons.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'h-2 w-2 rounded-full transition-all duration-500',
                    index === currentIconIndex
                      ? 'bg-primary scale-125'
                      : 'bg-muted-foreground/30 scale-100'
                  )}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function TripPointsOfInterestSection({ trip }: TripPointsOfInterestSectionProps) {
  const cityName = trip.destinationName || trip.destinationLocation
  
  const { places: allPlaces, isLoading, error, refetch } = usePointsOfInterest({
    city: cityName,
    limit: 22,
    enabled: !!cityName,
  })

  const places = allPlaces.filter(poi => poi.name?.trim() && poi.name.trim() !== 'Unknown Place')
  
  // Paginate places with load more functionality (10 initially, 6 per load)
  const { displayedItems: displayedPlaces, hasMore: canLoadMore, loadMore: handleLoadMore } = usePaginatedItems(places, 10, 6)

  const getCategoryVarName = (category: string): string => {
    const map: Record<string, string> = {
      'Castle': 'castle',
      'Monument': 'monument',
      'Museum': 'museum',
      'Religious Site': 'religious',
      'Park': 'park',
      'Tower': 'tower',
      'Square': 'square',
      'Memorial': 'memorial',
      'Attraction': 'attraction',
      'Artwork': 'artwork',
      'Fort': 'fort',
      'City Gate': 'city-gate',
      'Historic Site': 'historic',
      'Landmark': 'landmark',
    }
    return map[category] || 'default'
  }

  const getCategoryStyle = (category: string): React.CSSProperties => {
    const varName = getCategoryVarName(category)
    return {
      backgroundColor: `var(--place-category-${varName}-bg)`,
      color: `var(--place-category-${varName}-text)`,
    }
  }

  const getCategoryBorderStyle = (category: string): React.CSSProperties => {
    const varName = getCategoryVarName(category)
    return {
      borderColor: `var(--place-category-${varName}-border)`,
    }
  }

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, typeof Castle> = {
      'Castle': Castle,
      'Monument': University,
      'Museum': Amphora,
      'Religious Site': Church,
      'Park': TreePine,
      'Tower': TowerControl,
      'Square': Square,
      'Memorial': Flower2,
      'Attraction': Star,
      'Artwork': Palette,
      'Fort': Shield,
      'City Gate': BrickWall,
      'Historic Site': Landmark,
      'Landmark': MapPin,
    }
    return iconMap[category] || MapPin
  }


  if (isLoading) {
    return <LoadingState cityName={cityName} />
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Points of Interest in {cityName}
          </h3>
          <p className="text-sm text-muted-foreground">
            Discover interesting places to visit during your trip
          </p>
        </div>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="text-destructive font-medium mb-2">Failed to load places</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (places.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Points of Interest in {cityName}
          </h3>
          <p className="text-sm text-muted-foreground">
            Discover interesting places to visit during your trip
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">
              No points of interest found for {cityName}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Try searching for a different destination
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Points of Interest in {cityName}
        </h3>
        <p className="text-sm text-muted-foreground">
          We think these places are worth checking out
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedPlaces.map((poi) => {
          const CategoryIcon = getCategoryIcon(poi.category)
          return (
            <Card
              key={poi.id}
              className={cn(
                'overflow-hidden border-2 transition-all duration-300',
                'hover:shadow-lg hover:shadow-primary/5 hover:scale-[1.02]',
                'bg-card'
              )}
              style={getCategoryBorderStyle(poi.category)}
            >
            <CardContent className="p-5 relative">
              <div className="absolute top-5 right-5">
                <div 
                  className="p-2.5 rounded-lg"
                  style={{ 
                    backgroundColor: `var(--place-category-${getCategoryVarName(poi.category)}-bg, rgba(0,0,0,0.1))` 
                  }}
                >
                  <CategoryIcon 
                    className="h-6 w-6" 
                    style={{ 
                      color: `var(--place-category-${getCategoryVarName(poi.category)}-text, currentColor)` 
                    }} 
                  />
                </div>
              </div>
              <div className="flex items-start justify-between gap-3 mb-3 pr-16">
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-foreground mb-2">
                    {poi.name}
                  </h4>
                  <span 
                    className="text-xs px-2 py-1 rounded-md font-medium inline-block"
                    style={getCategoryStyle(poi.category)}
                  >
                    {poi.category}
                  </span>
                </div>
              </div>

              {poi.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {poi.description}
                </p>
              )}

              {poi.address && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground mb-4">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
                  <span className="line-clamp-2 flex-1">{poi.address}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {poi.website && (
                  <a
                    href={poi.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Website
                  </a>
                )}
                {poi.wikipedia && (
                  <a
                    href={poi.wikipedia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Wikipedia
                  </a>
                )}
                {poi.latitude && poi.longitude && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${poi.latitude},${poi.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View on Map
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
          )
        })}
      </div>

      {canLoadMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            className="gap-2"
          >
            <ChevronDown className="h-4 w-4" />
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}
