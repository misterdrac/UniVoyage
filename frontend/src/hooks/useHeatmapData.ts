import { useEffect, useState, useRef } from 'react'
import { API_CONFIG } from '@/config/apiConfig'

interface HeatmapPointRaw {
  destinationName: string
  destinationLocation: string
  tripCount: number
}

export interface HeatmapPoint {
  lat: number
  lng: number
  intensity: number
  name: string
}

const GEOCODE_CACHE_KEY = 'univoyage_geocode_cache'

function loadCache(): Record<string, { lat: number; lng: number }> {
  try {
    return JSON.parse(localStorage.getItem(GEOCODE_CACHE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveCache(cache: Record<string, { lat: number; lng: number }>) {
  try {
    localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache))
  } catch { /* quota exceeded -- ignore */ }
}

async function geocode(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      { headers: { 'User-Agent': 'UniVoyage/1.0' } }
    )
    const data = await res.json()
    if (data?.[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    }
    return null
  } catch {
    return null
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function useHeatmapData() {
  const [points, setPoints] = useState<HeatmapPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef(false)

  useEffect(() => {
    abortRef.current = false

    async function fetchAndGeocode() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`${API_CONFIG.BASE_URL}/heatmap`)
        if (!res.ok) throw new Error('Failed to fetch heatmap data')

        const json = await res.json()
        const raw: HeatmapPointRaw[] = json.data?.points ?? []

        if (raw.length === 0) {
          setPoints([])
          setIsLoading(false)
          return
        }

        const cache = loadCache()
        const result: HeatmapPoint[] = []
        let cacheUpdated = false

        for (const p of raw) {
          if (abortRef.current) return

          const key = `${p.destinationName}, ${p.destinationLocation}`
          let coords = cache[key]

          if (!coords) {
            const geocoded = await geocode(key)
            if (geocoded) {
              coords = geocoded
              cache[key] = coords
              cacheUpdated = true
            }
            await delay(1100)
          }

          if (coords) {
            result.push({
              lat: coords.lat,
              lng: coords.lng,
              intensity: p.tripCount,
              name: p.destinationName,
            })
          }
        }

        if (abortRef.current) return

        if (cacheUpdated) saveCache(cache)
        setPoints(result)
      } catch (err) {
        if (!abortRef.current) {
          setError(err instanceof Error ? err.message : 'Something went wrong')
        }
      } finally {
        if (!abortRef.current) setIsLoading(false)
      }
    }

    fetchAndGeocode()

    return () => {
      abortRef.current = true
    }
  }, [])

  return { points, isLoading, error }
}
