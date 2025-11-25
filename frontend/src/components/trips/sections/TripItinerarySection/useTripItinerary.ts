import { useCallback, useEffect, useMemo, useState } from 'react'
import { GoogleGenAI } from '@google/genai'
import { useAuth } from '@/contexts/AuthContext'
import { calculateDurationInDays, formatDateLong } from '@/lib/dateUtils'
import type { Trip } from '@/types/trip'
import type { TripStatus } from '@/lib/tripStatusUtils'
import type {
  NormalizedItinerary,
  NormalizedItineraryDay,
  NormalizedItinerarySegment,
} from './types'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? ''
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL ?? 'gemini-3.5-flash'

const geminiClient = GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    })
  : null

const SEGMENT_TIME_FALLBACKS = ['Morning', 'Afternoon', 'Evening']
const LOADING_STEPS = [
  'Mapping day themes…',
  'Pairing cafés and restaurants…',
  'Sequencing travel times…',
  'Sprinkling in slow moments…',
  'Checking evening highlights…',
]

interface GeminiItinerarySegment {
  time?: string
  activity?: string
  details?: string
  note?: string
}

interface GeminiItineraryDay {
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

interface GeminiItinerary {
  intro?: string
  opening?: string
  days?: GeminiItineraryDay[]
  logistics?: Array<{ title?: string; detail?: string; icon?: string }>
  closingNote?: string
  farewell?: string
  outro?: string
}

interface StoredItineraryPayload {
  structured: NormalizedItinerary | null
  raw: string | null
  signature: string | null
}

interface UseTripItineraryArgs {
  trip: Trip
  currentStatus: TripStatus
}

export interface UseTripItineraryResult {
  structuredItinerary: NormalizedItinerary | null
  rawItinerary: string | null
  error: string | null
  isLoading: boolean
  loadingMessage: string
  locationLabel: string
  durationInDays: number
  hasExistingPlan: boolean
  hasStalePlan: boolean
  canRefreshPlan: boolean
  isTripPlanned: boolean
  generateItinerary: () => Promise<void>
}

export function useTripItinerary({ trip, currentStatus }: UseTripItineraryArgs): UseTripItineraryResult {
  const { user } = useAuth()
  const [structuredItinerary, setStructuredItinerary] = useState<NormalizedItinerary | null>(null)
  const [rawItinerary, setRawItinerary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStepIndex, setLoadingStepIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [cachedSignature, setCachedSignature] = useState<string | null>(null)

  const storageKey = useMemo(() => `trip-itinerary-${trip.id}`, [trip.id])

  const userHobbies = useMemo(() => {
    return user?.hobbies && Array.isArray(user.hobbies) && user.hobbies.length > 0 ? user.hobbies : []
  }, [user?.hobbies])

  const locationLabel = useMemo(() => {
    return trip.destinationLocation
      ? `${trip.destinationName}, ${trip.destinationLocation}`
      : trip.destinationName
  }, [trip.destinationLocation, trip.destinationName])

  const itineraryDates = useMemo(() => {
    const parsedStart = new Date(trip.departureDate)
    const parsedEnd = new Date(trip.returnDate)
    if (Number.isNaN(parsedStart.getTime())) return []

    const dates: Array<{ iso: string; label: string }> = []
    if (Number.isNaN(parsedEnd.getTime()) || parsedEnd < parsedStart) {
      dates.push({
        iso: parsedStart.toISOString().split('T')[0],
        label: formatDateLong(parsedStart),
      })
      return dates
    }

    const cursor = new Date(parsedStart)
    while (cursor <= parsedEnd) {
      dates.push({
        iso: cursor.toISOString().split('T')[0],
        label: formatDateLong(cursor),
      })
      cursor.setDate(cursor.getDate() + 1)
    }

    return dates
  }, [trip.departureDate, trip.returnDate])

  const dateSignature = useMemo(
    () => (itineraryDates.length ? itineraryDates.map((day) => day.iso).join('|') : null),
    [itineraryDates]
  )

  const hobbiesSignature = useMemo(() => {
    if (!userHobbies.length) return ''
    return [...userHobbies].sort().join(',')
  }, [userHobbies])

  const fullSignature = useMemo(
    () => `${dateSignature ?? ''}|${hobbiesSignature}`,
    [dateSignature, hobbiesSignature]
  )

  const durationInDays = useMemo(
    () => calculateDurationInDays(trip.departureDate, trip.returnDate),
    [trip.departureDate, trip.returnDate]
  )

  const persistItinerary = useCallback(
    (payload: Omit<StoredItineraryPayload, 'signature'>) => {
      if (typeof window === 'undefined') return
      const snapshot: StoredItineraryPayload = {
        ...payload,
        signature: fullSignature || null,
      }
      localStorage.setItem(storageKey, JSON.stringify(snapshot))
      setCachedSignature(snapshot.signature ?? null)
    },
    [fullSignature, storageKey]
  )

  const normalizeItinerary = useCallback(
    (payload: GeminiItinerary | null): NormalizedItinerary | null => {
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
    },
    [itineraryDates]
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const cached = localStorage.getItem(storageKey)
    if (!cached) return
    try {
      const parsed = JSON.parse(cached) as StoredItineraryPayload
      setCachedSignature(parsed.signature ?? null)
      if (parsed.structured) {
        setStructuredItinerary(normalizeItinerary(parsed.structured as unknown as GeminiItinerary))
      } else if (parsed.raw) {
        setRawItinerary(parsed.raw)
      }
    } catch (err) {
      console.error('Failed to load cached itinerary', err)
    }
  }, [normalizeItinerary, storageKey])

  useEffect(() => {
    if (!isLoading) {
      setLoadingStepIndex(0)
      return
    }
    const interval = window.setInterval(() => {
      setLoadingStepIndex((prev) => (prev + 1) % LOADING_STEPS.length)
    }, 2000)
    return () => window.clearInterval(interval)
  }, [isLoading])

  const buildPrompt = useCallback(() => {
    const dateRange = `${formatDateLong(trip.departureDate)} – ${formatDateLong(trip.returnDate)}`
    const dayAnchors = itineraryDates.map((day, idx) => `Day ${idx + 1} (${day.label})`).join('\n')
    const totalDays = Math.max(itineraryDates.length, 1)
    const hobbiesContext = userHobbies.length > 0
      ? `\nTraveler interests: ${userHobbies.join(', ')}. Prioritize activities, experiences, and venues that align with these interests throughout the itinerary.`
      : ''

    return `
You are a modern travel designer crafting a ${totalDays}-day roadmap itinerary for curious travelers visiting ${locationLabel}.

Trip window: ${dateRange}
Daily anchors:
${dayAnchors || `Day 1 (${formatDateLong(trip.departureDate)})`}${hobbiesContext}

Focus: mix culture, food, scenic walks, mindful pauses, and one memorable evening experience. Mention realistic neighborhoods, transport options, and dining cues for ${locationLabel}.

Return STRICT JSON ONLY following:
{
  "intro": "1 sentence welcome",
  "days": [
    {
      "dayNumber": 1,
      "dateLabel": "Mon, Jun 2",
      "title": "Theme name",
      "vibe": "Mood such as Culture / Coastline",
      "summary": "1 sentence overview",
      "segments": [
        { "time": "Morning", "activity": "Key activity", "details": "Include why + transport or ticket tip" },
        { "time": "Afternoon", "activity": "Second experience", "details": "Add local insight" },
        { "time": "Evening", "activity": "Wrap-up idea", "details": "Include dining/nightlife cue" }
      ],
      "dining": ["Restaurant or cafe + signature dish"],
      "tips": ["Action-focused reminder under 80 characters"]
    }
  ],
  "logistics": [
    { "title": "Transit", "detail": "Passes, ride-share, or walking notes" },
    { "title": "Reservations", "detail": "What needs booking" }
  ],
  "closingNote": "Friendly send-off"
}

Rules:
- Provide exactly ${totalDays} day objects.
- Keep every string under 160 characters.
- Tips must be practical, specific reminders (start with verbs or include concrete cues).
- No markdown, bullet markers, or additional keys.
- Mention rest/slow moments at least once.
- Include diverse areas of ${locationLabel} across days.
`.trim()
  }, [itineraryDates, locationLabel, trip.departureDate, trip.returnDate, userHobbies])

  const generateItinerary = useCallback(async () => {
    if (!GEMINI_API_KEY) {
      setError('Missing Gemini API key. Set VITE_GEMINI_API_KEY to unlock itineraries.')
      return
    }

    if (!GEMINI_MODEL) {
      setError('Missing Gemini model. Set VITE_GEMINI_MODEL (e.g., gemini-3.5-flash).')
      return
    }

    if (!geminiClient) {
      setError('Gemini client is not initialized. Check your API key.')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setStructuredItinerary(null)
      setRawItinerary(null)

      const response = await geminiClient.models.generateContent({
        model: GEMINI_MODEL,
        contents: buildPrompt(),
      })

      const text = response.text?.trim()
      if (!text) {
        throw new Error('Gemini returned an empty response. Please try again.')
      }

      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim()

      try {
        const parsed = JSON.parse(cleaned) as GeminiItinerary
        const normalized = normalizeItinerary(parsed)
        if (normalized) {
          setStructuredItinerary(normalized)
          setRawItinerary(null)
          persistItinerary({ structured: normalized, raw: null })
        } else {
          setStructuredItinerary(null)
          setRawItinerary(cleaned)
          persistItinerary({ structured: null, raw: cleaned })
        }
      } catch {
        setStructuredItinerary(null)
        setRawItinerary(cleaned)
        persistItinerary({ structured: null, raw: cleaned })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate itinerary.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [buildPrompt, normalizeItinerary, persistItinerary])

  const hasExistingPlan = Boolean(structuredItinerary || rawItinerary)
  const hasStalePlan = Boolean(cachedSignature && fullSignature && cachedSignature !== fullSignature)
  const isTripPlanned = currentStatus === 'planned'
  const canRefreshPlan = hasExistingPlan && hasStalePlan && isTripPlanned

  return {
    structuredItinerary,
    rawItinerary,
    error,
    isLoading,
    loadingMessage: LOADING_STEPS[loadingStepIndex],
    locationLabel,
    durationInDays,
    hasExistingPlan,
    hasStalePlan,
    canRefreshPlan,
    isTripPlanned,
    generateItinerary,
  }
}

