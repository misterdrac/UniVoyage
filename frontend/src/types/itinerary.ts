/**
 * Activity segment within an itinerary day
 */
export interface NormalizedItinerarySegment {
  time: string
  activity: string
  details?: string
}

/**
 * Single day in a normalized itinerary
 */
export interface NormalizedItineraryDay {
  dayNumber: number
  dateLabel: string
  title: string
  summary?: string
  vibe?: string
  segments: NormalizedItinerarySegment[]
  dining: string[]
  tips: string[]
}

/**
 * Complete normalized itinerary structure with days and segments
 */
export interface NormalizedItinerary {
  intro?: string
  days: NormalizedItineraryDay[]
  logistics: Array<{ title: string; detail: string }>
  closingNote?: string
}

/**
 * Itinerary data stored in backend/localStorage (structured or raw format)
 */
export interface StoredItineraryPayload {
  structured: NormalizedItinerary | null
  raw: string | null
  signature: string | null
}


