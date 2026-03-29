/**
 * OpenStreetMap Nominatim (public instance).
 * @see https://operations.osmfoundation.org/policies/nominatim/ — max ~1 req/s.
 */

const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search'
const USER_AGENT = 'UniVoyage/1.0'

export interface NominatimGeocodeResult {
  lat: number
  /** Longitude (same as OSM `lon` field). */
  lng: number
  displayName?: string
}

/**
 * Geocode a free-text query (e.g. "Paris, France").
 * Returns null if nothing found or on network/parse errors.
 */
export async function searchNominatim(query: string): Promise<NominatimGeocodeResult | null> {
  const q = query.trim()
  if (!q) return null

  try {
    const url = `${NOMINATIM_SEARCH_URL}?format=json&q=${encodeURIComponent(q)}&limit=1`
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
    })
    if (!res.ok) return null

    const data: unknown = await res.json()
    if (!Array.isArray(data) || data.length === 0) return null

    const first = data[0] as { lat?: string; lon?: string; display_name?: string }
    if (first.lat == null || first.lon == null) return null

    return {
      lat: parseFloat(first.lat),
      lng: parseFloat(first.lon),
      displayName: first.display_name,
    }
  } catch (err) {
    console.error('Nominatim geocoding error:', err)
    return null
  }
}
