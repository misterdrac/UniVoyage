import { useCallback, useEffect, useMemo, useState } from 'react'
import { GoogleGenAI } from '@google/genai'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { calculateDurationInDays, formatDateLong } from '@/lib/dateUtils'
import type { Trip } from '@/types/trip'
import type { TripStatus } from '@/lib/tripStatusUtils'
import { useAuth } from '@/contexts/AuthContext'
import {
  AlertCircle,
  CalendarDays,
  Clock,
  Loader2,
  MapPin,
  RefreshCw,
  Sparkles,
} from 'lucide-react'

interface TripItinerarySectionProps {
  trip: Trip
  currentStatus: TripStatus
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? ''
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL ?? 'gemini-3.5-flash'

const geminiClient = GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    })
  : null

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

interface NormalizedItinerarySegment {
  time: string
  activity: string
  details?: string
}

interface NormalizedItineraryDay {
  dayNumber: number
  dateLabel: string
  title: string
  summary?: string
  vibe?: string
  segments: NormalizedItinerarySegment[]
  dining: string[]
  tips: string[]
}

interface NormalizedItinerary {
  intro?: string
  days: NormalizedItineraryDay[]
  logistics: Array<{ title: string; detail: string }>
  closingNote?: string
}

interface StoredItineraryPayload {
  structured: NormalizedItinerary | null
  raw: string | null
  signature: string | null
}

const SEGMENT_TIME_FALLBACKS = ['Morning', 'Afternoon', 'Evening']

export function TripItinerarySection({ trip, currentStatus }: TripItinerarySectionProps) {
  const { user } = useAuth()
  const [structuredItinerary, setStructuredItinerary] = useState<NormalizedItinerary | null>(null)
  const [rawItinerary, setRawItinerary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cachedSignature, setCachedSignature] = useState<string | null>(null)

  const storageKey = useMemo(() => `trip-itinerary-${trip.id}`, [trip.id])

  const userHobbies = useMemo(() => {
    return user?.hobbies && Array.isArray(user.hobbies) && user.hobbies.length > 0
      ? user.hobbies
      : []
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

  const hobbiesSignature = useMemo(
    () => (userHobbies.length > 0 ? userHobbies.sort().join(',') : ''),
    [userHobbies]
  )

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

  const buildPrompt = useCallback(() => {
    const dateRange = `${formatDateLong(trip.departureDate)} – ${formatDateLong(trip.returnDate)}`
    const dayAnchors = itineraryDates
      .map((day, idx) => `Day ${idx + 1} (${day.label})`)
      .join('\n')
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
      "tips": ["Quick practical or cultural tip"]
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

  const renderSegments = (segments: NormalizedItinerarySegment[]) => {
    if (!segments.length) return null
    return (
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {segments.map((segment, idx) => (
          <div
            key={`${segment.time}-${idx}`}
            className="rounded-xl border bg-card/80 p-3 shadow-sm"
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-primary" />
              {segment.time}
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">{segment.activity}</p>
            {segment.details && (
              <p className="mt-1 text-sm text-muted-foreground">{segment.details}</p>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderDay = (day: NormalizedItineraryDay, isLast: boolean) => (
    <div key={`itinerary-day-${day.dayNumber}-${day.title}`} className="relative pl-10">
      <div className="absolute left-3 top-4 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-primary bg-background shadow-sm" />
      {!isLast && (
        <div className="absolute left-3.5 top-8 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/10 to-transparent" />
      )}
      <div className="rounded-2xl border bg-gradient-to-br from-background via-card to-background p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Day {day.dayNumber} • {day.dateLabel}
            </p>
            <h4 className="text-lg font-semibold text-foreground">{day.title}</h4>
          </div>
          {day.vibe && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {day.vibe}
            </span>
          )}
        </div>
        {day.summary && <p className="mt-2 text-sm text-muted-foreground">{day.summary}</p>}
        {renderSegments(day.segments)}
        {(day.dining.length > 0 || day.tips.length > 0) && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {day.dining.length > 0 && (
              <div className="rounded-xl border border-dashed bg-muted/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Dining & sips
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {day.dining.map((item, idx) => (
                    <li key={`${item}-${idx}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {day.tips.length > 0 && (
              <div className="rounded-xl border border-dashed bg-muted/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Quick tips
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {day.tips.map((tip, idx) => (
                    <li key={`${tip}-${idx}`}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )

  const renderItinerary = () => {
    if (!structuredItinerary) return null
    return (
      <div className="space-y-8">
        {(structuredItinerary.intro || currentStatus === 'ongoing') && (
          <Card className="border border-primary/20 bg-gradient-to-r from-primary/5 via-background to-card shadow-sm">
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {structuredItinerary.intro || 'Live trip insights'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {locationLabel} • {durationInDays} {durationInDays === 1 ? 'day' : 'days'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="h-4 w-4 text-primary" />
                {formatDateLong(trip.departureDate)} – {formatDateLong(trip.returnDate)}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="relative">
          <div
            className="pointer-events-none absolute left-3 top-0 h-full w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent"
            aria-hidden="true"
          />
          <div className="space-y-8">
            {structuredItinerary.days.map((day, idx) => renderDay(day, idx === structuredItinerary.days.length - 1))}
          </div>
        </div>

        {structuredItinerary.logistics.length > 0 && (
          <Card className="border border-dashed">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Practical logistics
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {structuredItinerary.logistics.map((item, idx) => (
                  <div key={`${item.title}-${idx}`} className="rounded-xl border bg-muted/30 p-4">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{item.detail}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {structuredItinerary.closingNote && (
          <Card className="border-0 bg-card/80 text-center shadow-md">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{structuredItinerary.closingNote}</p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderRawFallback = () => {
    if (!rawItinerary) return null

    let formatted = rawItinerary
    try {
      formatted = JSON.stringify(JSON.parse(rawItinerary), null, 2)
    } catch {
      formatted = rawItinerary
    }

    return (
      <div className="rounded-xl border bg-muted/40 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Gemini raw response
        </div>
        <pre className="max-h-[420px] overflow-auto text-xs font-mono text-muted-foreground whitespace-pre-wrap break-words">
          {formatted}
        </pre>
      </div>
    )
  }

  const hasExistingPlan = Boolean(structuredItinerary || rawItinerary)
  const hasStalePlan = Boolean(cachedSignature && fullSignature && cachedSignature !== fullSignature)
  const isGeminiConfigured = Boolean(GEMINI_API_KEY && GEMINI_MODEL && geminiClient)

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card/60 p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            {locationLabel}
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            {formatDateLong(trip.departureDate)} – {formatDateLong(trip.returnDate)}
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Gemini crafts a day-by-day roadmap styled like a modern journey line. Adjustments stay cached per trip.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {hasStalePlan && (
        <div className="rounded-xl border border-info/30 bg-info/5 p-3 text-xs text-info">
          Your travel dates or interests changed since this itinerary was generated. Refresh for the latest personalized flow.
        </div>
      )}

      {!isGeminiConfigured && (
        <div className="rounded-xl border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
          Set <code className="rounded bg-muted px-1 py-0.5 text-xs">VITE_GEMINI_API_KEY</code> and{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">VITE_GEMINI_MODEL</code> to enable AI itineraries.
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          {hasExistingPlan
            ? 'Regenerate anytime to adjust the vibes or reflect new dates.'
            : 'Let Gemini outline the key beats of your adventure in seconds.'}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={generateItinerary}
            disabled={isLoading || !isGeminiConfigured}
            className={cn(
              'flex items-center gap-2',
              (isLoading || !isGeminiConfigured) && 'cursor-not-allowed opacity-80'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : hasExistingPlan ? (
              <>
                <RefreshCw className="h-4 w-4" />
                Regenerate itinerary
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate itinerary
              </>
            )}
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Mapping your roadmap…
        </div>
      )}

      {structuredItinerary && renderItinerary()}
      {!structuredItinerary && renderRawFallback()}

      {!hasExistingPlan && !isLoading && (
        <div className="rounded-2xl border border-dashed bg-muted/20 p-6 text-center">
          <Sparkles className="mx-auto h-5 w-5 text-primary" />
          <p className="mt-3 text-sm font-semibold text-foreground">Ready for lift-off?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate an itinerary to see a flowing roadmap with curated meals, slow moments, and evening highlights.
          </p>
        </div>
      )}
    </div>
  )
}


