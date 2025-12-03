import { formatDateLong } from '@/lib/dateUtils'
import type {
  NormalizedItinerary,
  NormalizedItineraryDay,
  NormalizedItinerarySegment,
} from '@/types/itinerary'

export const SEGMENT_TIME_FALLBACKS = ['Morning', 'Afternoon', 'Evening']

export const LOADING_STEPS = [
  'Mapping day themes…',
  'Checkking out restaurants and cafes…',
  'Consulting local experts…',
  'Inspecting transport options…',
  'Finding hidden gems…',
  'Making sure everything is perfect…'
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

interface BuildPromptArgs {
  itineraryDates: Array<{ iso: string; label: string }>
  locationLabel: string
  departureDate: string
  returnDate: string
  userHobbies: string[]
}

export const buildGeminiPrompt = ({
  itineraryDates,
  locationLabel,
  departureDate,
  returnDate,
  userHobbies,
}: BuildPromptArgs): string => {
  const dateRange = `${formatDateLong(departureDate)} – ${formatDateLong(returnDate)}`
  const dayAnchors = itineraryDates.map((day, idx) => `Day ${idx + 1} (${day.label})`).join('\n')
  const totalDays = Math.max(itineraryDates.length, 1)
  const hobbiesContext = userHobbies.length
    ? `\nTraveler interests: ${userHobbies.join(', ')}. Prioritize activities, experiences, and venues that align with these interests throughout the itinerary.`
    : ''

  return `
You are a modern travel designer crafting a ${totalDays}-day roadmap itinerary for curious travelers visiting ${locationLabel}.

Trip window: ${dateRange}
Daily anchors:
${dayAnchors || `Day 1 (${formatDateLong(departureDate)})`}${hobbiesContext}

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

/**
 * Handles Gemini API errors - logs full in console, returns message to user
 */
export const handleGeminiError = (err: unknown): string => {
  console.error('[Itinerary Generation Error]', err)
  return 'Oops! Something went wrong while generating your itinerary. Please try again in a moment.'
}


