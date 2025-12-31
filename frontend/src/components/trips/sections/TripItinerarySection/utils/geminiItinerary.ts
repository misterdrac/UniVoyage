import type {
  NormalizedItinerary,
  NormalizedItineraryDay,
  NormalizedItinerarySegment,
} from '@/types/itinerary'

export const SEGMENT_TIME_FALLBACKS = ['Morning', 'Afternoon', 'Evening']

export const LOADING_STEPS = [
  'Mapping day themes…',
  'Checking out restaurants and cafes…',
  'Consulting local experts…',
  'Inspecting transport options…',
  'Finding hidden gems…',
  'Mapping the points of interest…',
  'Making sure everything is perfect…',
  'Almost there…',
  'Checking out the weather…',
]

export interface GeminiItinerarySegment {
  time?: string
  activity?: string
  details?: string
  note?: string
}

export interface GeminiItineraryDay {
  dayNumber?: number
  dateLabel?: string
  title?: string
  theme?: string
  vibe?: string
  summary?: string
  overview?: string
  segments?: GeminiItinerarySegment[]
  dining?: string[]
  meals?: string[]
  tips?: string[]
  notes?: string[]
}

export interface GeminiItinerary {
  intro?: string
  opening?: string
  days?: GeminiItineraryDay[]
  logistics?: Array<{ title?: string; detail?: string; icon?: string }>
  closingNote?: string
  farewell?: string
  outro?: string
}

export const normalizeGeminiItinerary = (
  payload: GeminiItinerary | null,
  itineraryDates: Array<{ iso: string; label: string }>
): NormalizedItinerary | null => {
  if (!payload) return null
  const days = Array.isArray(payload.days) ? payload.days : []
  if (!days.length) return null

  const normalizedDays: NormalizedItineraryDay[] = days
    .map((day, index) => {
      const fallbackDate = itineraryDates[index]?.label ?? `Day ${index + 1}`
      const usableSegments = Array.isArray(day.segments) ? day.segments : []
      const normalizedSegments: NormalizedItinerarySegment[] = usableSegments
        .filter((segment) => typeof segment?.activity === 'string' && segment.activity.trim().length > 0)
        .map((segment, segIndex) => ({
          time:
            segment.time?.trim() ??
            SEGMENT_TIME_FALLBACKS[segIndex] ??
            SEGMENT_TIME_FALLBACKS[SEGMENT_TIME_FALLBACKS.length - 1],
          activity: segment.activity!.trim(),
          details: segment.details ?? segment.note ?? '',
        }))

      const dining =
        Array.isArray(day.dining) && day.dining.length
          ? day.dining
          : Array.isArray(day.meals)
          ? day.meals
          : []

      const tips =
        Array.isArray(day.tips) && day.tips.length
          ? day.tips
          : Array.isArray(day.notes)
          ? day.notes
          : []

      return {
        dayNumber: day.dayNumber ?? index + 1,
        dateLabel: day.dateLabel ?? fallbackDate,
        title: day.title ?? `Day ${index + 1}`,
        summary: day.summary ?? day.overview ?? '',
        vibe: day.vibe ?? day.theme ?? '',
        segments: normalizedSegments,
        dining,
        tips,
      }
    })
    .filter(
      (day) =>
        day.segments.length > 0 ||
        Boolean(day.summary) ||
        day.dining.length > 0 ||
        day.tips.length > 0
    )

  if (!normalizedDays.length) return null

  const logistics = Array.isArray(payload.logistics)
    ? payload.logistics
        .filter((item) => item?.title && item?.detail)
        .map((item) => ({
          title: item!.title!.trim(),
          detail: item!.detail!.trim(),
        }))
    : []

  return {
    intro: payload.intro ?? payload.opening ?? '',
    days: normalizedDays.slice(0, itineraryDates.length || normalizedDays.length),
    logistics,
    closingNote: payload.closingNote ?? payload.farewell ?? payload.outro ?? '',
  }
}

