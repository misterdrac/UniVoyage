import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'
import 'leaflet/dist/leaflet.css'
import { Loader2 } from 'lucide-react'
import { useHeatmapData, type HeatmapPoint } from '@/hooks/useHeatmapData'

function HeatLayer({ points }: { points: HeatmapPoint[] }) {
  const map = useMap()
  const layerRef = useRef<L.Layer | null>(null)

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current)
      layerRef.current = null
    }

    if (points.length === 0) return

    const maxIntensity = Math.max(...points.map(p => p.intensity))

    const heatData: [number, number, number][] = points.map(p => [
      p.lat,
      p.lng,
      p.intensity / maxIntensity,
    ])

    const layer = L.heatLayer(heatData, {
      radius: 30,
      blur: 20,
      maxZoom: 10,
      minOpacity: 0.35,
      gradient: {
        0.2: '#818cf8',
        0.4: '#6366f1',
        0.6: '#a78bfa',
        0.8: '#c084fc',
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
  }, [points, map])

  return null
}

export function TravelHeatmapSection() {
  const { points, isLoading, error } = useHeatmapData()

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
              scrollWheelZoom={false}
              dragging={true}
              zoomControl={false}
              attributionControl={false}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              {points.length > 0 && <HeatLayer points={points} />}
            </MapContainer>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-3">
          Map data &copy; OpenStreetMap contributors &bull; CartoDB
        </p>
      </div>
    </section>
  )
}
