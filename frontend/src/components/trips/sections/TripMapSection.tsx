import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon, DivIcon } from 'leaflet'
import type { LatLngExpression } from 'leaflet'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Loader2, AlertCircle } from 'lucide-react'
import type { Trip } from '@/types/trip'
import { cn } from '@/lib/utils'
import { usePointsOfInterest } from '@/hooks/usePointsOfInterest'
import { PlacesLoadingCard } from './PlacesLoadingCard'

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Leaflet with bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Configure default icon for destination
const destinationIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Custom POI marker icon (purple/primary colored)
const createPoiIcon = () => new DivIcon({
  className: 'custom-poi-marker',
  html: `
    <div style="
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, hsl(271, 91%, 65%) 0%, hsl(271, 81%, 55%) 100%);
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
      "></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
})

const poiIcon = createPoiIcon()

interface TripMapSectionProps {
  trip: Trip
}

interface GeocodedLocation {
  lat: number
  lon: number
  displayName: string
}

// Component to recenter map when location changes
function MapRecenter({ center }: { center: LatLngExpression }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

// Geocode city name using Nominatim (OSM's free geocoding service)
async function geocodeCity(cityName: string): Promise<GeocodedLocation | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`,
      {
        headers: {
          'User-Agent': 'UniVoyage/1.0',
        },
      }
    )
    const data = await response.json()
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      }
    }
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

export function TripMapSection({ trip }: TripMapSectionProps) {
  const [location, setLocation] = useState<GeocodedLocation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get city name for POI search
  const cityName = trip.destinationName || trip.destinationLocation

  // Fetch points of interest
  const { places, isLoading: isLoadingPoi } = usePointsOfInterest({
    city: cityName,
    limit: 22,
  })

  // Filter POIs that have coordinates
  const poisWithCoords = useMemo(() => {
    return places.filter(poi => poi.latitude && poi.longitude)
  }, [places])

  // Combine destination name and location for better geocoding results
  const searchQuery = useMemo(() => {
    return `${trip.destinationName}, ${trip.destinationLocation}`
  }, [trip.destinationName, trip.destinationLocation])

  useEffect(() => {
    let isMounted = true

    const fetchLocation = async () => {
      setIsLoading(true)
      setError(null)

      const result = await geocodeCity(searchQuery)

      if (!isMounted) return

      if (result) {
        setLocation(result)
      } else {
        setError('Could not find location on map')
      }
      setIsLoading(false)
    }

    fetchLocation()

    return () => {
      isMounted = false
    }
  }, [searchQuery])

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Destination Map
          </h3>
          <p className="text-sm text-muted-foreground">
            Explore your destination on the map
          </p>
        </div>
        <Card className="border-2 border-dashed">
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <MapPin className="h-12 w-12 text-primary animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-foreground animate-pulse">
                  Finding {trip.destinationName}...
                </p>
                <div className="flex items-center justify-center gap-1">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Loading map data
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !location) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Destination Map
          </h3>
          <p className="text-sm text-muted-foreground">
            Explore your destination on the map
          </p>
        </div>
        <Card className="border-2 border-dashed border-destructive/30">
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive/70" />
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-foreground">
                  Unable to load map
                </p>
                <p className="text-sm text-muted-foreground">
                  {error || 'Could not find location for this destination'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const center: LatLngExpression = [location.lat, location.lon]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Destination Map
        </h3>
        <p className="text-sm text-muted-foreground">
          {trip.destinationName}, {trip.destinationLocation}
          {poisWithCoords.length > 0 && (
            <span className="ml-2">
              • {poisWithCoords.length} place{poisWithCoords.length !== 1 ? 's' : ''} to visit
            </span>
          )}
        </p>
      </div>

      {/* Show loading card while POIs are loading */}
      {isLoadingPoi && (
        <PlacesLoadingCard
          message="Loading places to show on map"
          compact
        />
      )}

      <Card className="overflow-hidden">
        <div
          className={cn(
            'relative w-full',
            'h-[400px] sm:h-[500px] lg:h-[600px]'
          )}
        >
          <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom={true}
            className="h-full w-full z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Destination marker */}
            <Marker position={center} icon={destinationIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">{trip.destinationName}</p>
                  <p className="text-sm text-muted-foreground">
                    {trip.destinationLocation}
                  </p>
                </div>
              </Popup>
            </Marker>
            {/* POI markers */}
            {poisWithCoords.map((poi) => (
              <Marker
                key={poi.id}
                position={[poi.latitude!, poi.longitude!]}
                icon={poiIcon}
              >
                <Popup>
                  <div className="min-w-[150px]">
                    <p className="font-semibold text-sm">{poi.name}</p>
                    <p className="text-xs text-primary font-medium">{poi.category}</p>
                    {poi.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {poi.description}
                      </p>
                    )}
                    {poi.address && (
                      <p className="text-xs text-muted-foreground mt-1">
                        📍 {poi.address}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
            <MapRecenter center={center} />
          </MapContainer>
        </div>
      </Card>

      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-4 var(--profile-stat-blue) rounded-sm" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
          <span>Destination</span>
        </div>
        {poisWithCoords.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div 
              className="w-3 h-3 rounded-full border border-hero-text" 
              style={{ background: 'linear-gradient(135deg, hsl(271, 91%, 65%) 0%, hsl(271, 81%, 55%) 100%)' }}
            />
            <span>Places to visit</span>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Map data © OpenStreetMap contributors
      </p>
    </div>
  )
}

