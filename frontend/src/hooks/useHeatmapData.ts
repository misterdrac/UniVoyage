import { useEffect, useState, useRef } from 'react'
import { apiService } from '@/services/api'
import type { HeatmapPointRaw } from '@/services/api/heatmapApi'
import { searchNominatim } from '@/services/external'

export interface HeatmapPoint {
  lat: number
  lng: number
  intensity: number
  name: string
  location: string
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
        const heatmapRes = await apiService.getHeatmapPoints()
        if (!heatmapRes.success) {
          throw new Error(heatmapRes.error ?? 'Failed to fetch heatmap data')
        }

        const raw: HeatmapPointRaw[] = heatmapRes.points ?? []

        if (raw.length === 0) {
          setPoints([])
          setIsLoading(false)
          return
        }

        const cache = loadCache()
        const mappedPoints: HeatmapPoint[] = []
        let cacheUpdated = false

        for (const p of raw) {
          if (abortRef.current) return

          const key = `${p.destinationName}, ${p.destinationLocation}`
          let coords = cache[key]

          if (!coords) {
            const geocoded = await searchNominatim(key)
            if (geocoded) {
              coords = geocoded
              cache[key] = coords
              cacheUpdated = true
            }
            //info: po policiyu nominatima ne bi trebali raditi vise od 1 request u sekundi
            await delay(1000)
          }

          if (coords) {
            mappedPoints.push({
              lat: coords.lat,
              lng: coords.lng,
              intensity: p.tripCount,
              name: p.destinationName,
              location: p.destinationLocation,
            })
          }
        }

        if (abortRef.current) return

        if (cacheUpdated) saveCache(cache)
        mappedPoints.sort((a, b) => b.intensity - a.intensity)
        setPoints(mappedPoints)
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
