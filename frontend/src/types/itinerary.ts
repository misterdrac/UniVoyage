export interface NormalizedItinerarySegment {
  time: string
  activity: string
  details?: string
}

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

export interface NormalizedItinerary {
  intro?: string
  days: NormalizedItineraryDay[]
  logistics: Array<{ title: string; detail: string }>
  closingNote?: string
}

export interface StoredItineraryPayload {
  structured: NormalizedItinerary | null
  raw: string | null
  signature: string | null
}


