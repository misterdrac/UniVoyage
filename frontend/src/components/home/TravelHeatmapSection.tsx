import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'
import 'leaflet/dist/leaflet.css'
import { Loader2 } from 'lucide-react'
import { useHeatmapData, type HeatmapPoint } from '@/hooks/useHeatmapData'
import { useDestinations } from '@/hooks/useDestinations'
import { HeatmapTopDestinations } from './HeatmapTopDestinations'
import {
  DEFAULT_DESTINATION_IMAGE,
  findDestinationByHeatmapLabels,
} from '@/lib/destinationUtils'

/** Must match L.heatLayer option — used in leaflet.heat's zoom factor `v` (see node_modules/leaflet.heat). */
const HEAT_MAX_ZOOM = 10

/**
 * Same formula as leaflet.heat 
 */
function heatZoomFactor(mapZoom: number): number {
  const exp = Math.max(0, Math.min(HEAT_MAX_ZOOM - mapZoom, 12))
  return 1 / Math.pow(2, exp)
}

function HeatLayer({ points }: { points: HeatmapPoint[] }) {
  const map = useMap()
  const layerRef = useRef<L.Layer | null>(null)
  const [zoom, setZoom] = useState(() => map.getZoom())

  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  })

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current)
      layerRef.current = null
    }

    if (points.length === 0) return

    const maxIntensity = Math.max(...points.map(p => p.intensity))
    const v = heatZoomFactor(zoom)

    // Pre-divide by v so that after leaflet.heat multiplies by v, we get tripCount/max again (e.g. 1 vs 0.25).
    const heatData: [number, number, number][] = points.map(p => [
      p.lat,
      p.lng,
      (p.intensity / maxIntensity) / v,
    ])

    const layer = L.heatLayer(heatData, {
      radius: 50,
      blur: 30,
      maxZoom: HEAT_MAX_ZOOM,
      max: 1,
      // Keep low — high values flatten all spots to the same alpha (see simpleheat draw + zoom scaling).
      minOpacity: 0.05,
      gradient: {
        0: '#e0e7ff',
        0.1: '#c7d2fe',
        0.2: '#a5b4fc',
        0.35: '#818cf8',
        0.5: '#6366f1',
        0.65: '#8b5cf6',
        0.8: '#c084fc',
        0.9: '#d946ef',
        1.0: '#e879f9',
      },
    })

    layer.addTo(map)
    layerRef.current = layer

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current)
        layerRef.current = null
      }
    }
  }, [points, map, zoom])

  return null
}

export function TravelHeatmapSection() {
  const { points, isLoading, error } = useHeatmapData()
  const { destinations } = useDestinations()

  const topDestinationItems = useMemo(() => {
    return points.slice(0, 3).map((point, index) => {
      const matched = findDestinationByHeatmapLabels(
        point.name,
        point.location,
        destinations
      )
      const name = matched?.title ?? point.name
      return {
        rank: index + 1,
        name,
        country: point.location,
        imageUrl: matched?.imageUrl ?? DEFAULT_DESTINATION_IMAGE,
        imageAlt: matched?.imageAlt ?? name,
      }
    })
  }, [points, destinations])

  if (error) return null
  if (!isLoading && points.length === 0) return null

  return (
    <section className="pb-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Where Our Users Travel
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See the most popular destinations among UniVoyage travelers
          </p>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-border shadow-sm">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading travel data…</span>
              </div>
            </div>
          )}

          <div className="h-[350px] sm:h-[420px] lg:h-[480px]">
            <MapContainer
              center={[35, 15]}
              zoom={3}
              scrollWheelZoom
              dragging
              className="h-full w-full z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {points.length > 0 && <HeatLayer points={points} />}
            </MapContainer>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-3">
          Map data &copy; OpenStreetMap contributors
        </p>

        {!isLoading && topDestinationItems.length > 0 && (
          <HeatmapTopDestinations items={topDestinationItems} />
        )}
      </div>
    </section>
  )
}
