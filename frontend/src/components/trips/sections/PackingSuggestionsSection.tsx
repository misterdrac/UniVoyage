import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { ForecastDay } from '@/components/ui/weather-widget'
import type { TripStatus } from '@/lib/tripStatusUtils'
import { GoogleGenAI } from '@google/genai'
import { cn } from '@/lib/utils'
import { Loader2, Sparkles, AlertTriangle } from 'lucide-react'

interface PackingSuggestionsSectionProps {
  tripId: number
  destinationName: string
  departureDate: string
  returnDate: string
  forecast: ForecastDay[] | null
  currentStatus: TripStatus
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? ''
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL ?? ''

const geminiClient = GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    })
  : null

interface SuggestionCategory {
  title: string
  icon?: string
  items: string[]
}

interface StructuredSuggestion {
  summary: string
  categories: SuggestionCategory[]
  reminders: string[]
}

interface StoredSuggestionPayload {
  structured: StructuredSuggestion | null
  raw: string | null
  forecastSummary: string | null
}

export function PackingSuggestionsSection({
  tripId,
  destinationName,
  departureDate,
  returnDate,
  forecast,
  currentStatus,
}: PackingSuggestionsSectionProps) {
  const [rawSuggestions, setRawSuggestions] = useState<string | null>(null)
  const [structuredSuggestions, setStructuredSuggestions] = useState<StructuredSuggestion | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cachedForecastSummary, setCachedForecastSummary] = useState<string | null>(null)

  const storageKey = useMemo(() => `packing-suggestions-${tripId}`, [tripId])

  const forecastSummary = useMemo(() => {
    if (!forecast || forecast.length === 0) return null
    return forecast
      .map((day) => {
        const high = Math.round(day.temperature.max)
        const low = Math.round(day.temperature.min)
        return `${day.dateLabel}: ${high}°C / ${low}°C, ${day.description}`
      })
      .join('\n')
  }, [forecast])

  const persistSuggestions = useCallback(
    (payload: StoredSuggestionPayload) => {
      if (typeof window === 'undefined') return
      const snapshot: StoredSuggestionPayload = {
        ...payload,
        forecastSummary: forecastSummary ?? null,
      }
      localStorage.setItem(storageKey, JSON.stringify(snapshot))
      setCachedForecastSummary(snapshot.forecastSummary)
    },
    [forecastSummary, storageKey]
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const cached = localStorage.getItem(storageKey)
    if (!cached) return
    try {
      const parsed = JSON.parse(cached) as StoredSuggestionPayload
      setCachedForecastSummary(parsed.forecastSummary ?? null)
      if (parsed.structured) {
        setStructuredSuggestions(parsed.structured)
        setRawSuggestions(null)
      } else if (parsed.raw) {
        setRawSuggestions(parsed.raw)
        setStructuredSuggestions(null)
      }
    } catch (err) {
      console.error('Failed to load cached packing suggestions', err)
    }
  }, [storageKey])

  const buildPrompt = () => {
    return `
You are a concise travel packing assistant.
Destination: ${destinationName}
Trip dates: ${departureDate} to ${returnDate}

Weather forecast (max/min in °C):
${forecastSummary}

Return a tailored packing plan in valid JSON ONLY using this schema:
{
  "summary": "short overview sentence",
  "categories": [
    { "title": "Clothing", "icon": "emoji", "items": [ "Item with explanation" ] },
    { "title": "Accessories", "icon": "emoji", "items": [ "Item with explanation" ] },
    { "title": "Documents & Electronics", "icon": "emoji", "items": [ "Item with explanation" ] },
    { "title": "Toiletries & Health", "icon": "emoji", "items": [ "Item with explanation" ] }
  ],
  "reminders": [
    "Short reminder"
  ]
}

Rules:
- Use exactly the four categories above in that order, 3-4 items each.
- Documents & Electronics must mention local plug type and voltage requirements.
- Toiletries & Health must mention disease-related precautions (e.g., malaria prophylaxis or vaccinations) if relevant to the region.
- Always include at least one reminder about documents or medications.
- Do not add markdown, commentary, triple backticks, or extra keys—JSON string only.`
  }

  const generateSuggestions = useCallback(async () => {
    if (!forecastSummary) {
      setError("Packing advice will appear once a forecast is available.")
      return
    }

    if (!GEMINI_API_KEY || !GEMINI_MODEL) {
      setError("AI features are temporarily unavailable. Please try again later.")
      return
    }

    if (!geminiClient) {
      setError("AI features are temporarily unavailable. Please try again later.")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setStructuredSuggestions(null)
      setRawSuggestions(null)

      const response = await geminiClient.models.generateContent({
        model: GEMINI_MODEL,
        contents: buildPrompt(),
      })

      const text = response.text?.trim()

      if (!text) {
        throw new Error("Gemini returned an empty response. Please try again.")
      }

      const cleaned = text
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim()

      try {
        const parsed = JSON.parse(cleaned) as StructuredSuggestion

        if (
          parsed &&
          typeof parsed.summary === 'string' &&
          Array.isArray(parsed.categories) &&
          parsed.categories.length > 0
        ) {
          setStructuredSuggestions(parsed)
          setRawSuggestions(null)
          persistSuggestions({ structured: parsed, raw: null, forecastSummary: forecastSummary ?? null })
        } else {
          setRawSuggestions(cleaned)
          setStructuredSuggestions(null)
          persistSuggestions({ structured: null, raw: cleaned, forecastSummary: forecastSummary ?? null })
        }
      } catch {
        setRawSuggestions(cleaned)
        setStructuredSuggestions(null)
        persistSuggestions({ structured: null, raw: cleaned, forecastSummary: forecastSummary ?? null })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate packing suggestions.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [forecastSummary, persistSuggestions])

  const renderFallbackJson = () => {
    if (!rawSuggestions) return null

    let formatted = rawSuggestions
    try {
      formatted = JSON.stringify(JSON.parse(rawSuggestions), null, 2)
    } catch {
      formatted = rawSuggestions
    }

    return (
      <div className="rounded-lg border bg-muted/40 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-muted-foreground">
            Gemini raw response
          </p>
        </div>
        <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap wrap-break-word">
          {formatted}
        </pre>
      </div>
    )
  }

  const renderStructured = () => {
    if (!structuredSuggestions) return null

    return (
      <div className="space-y-4">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary mt-0.5" />
          <p>{structuredSuggestions.summary}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {structuredSuggestions.categories.map((category, idx) => (
            <div
              key={`${category.title}-${idx}`}
              className="rounded-lg border bg-card/60 p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl" aria-hidden="true">
                  {category.icon ?? '🧳'}
                </span>
                <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {category.title}
                </h4>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {category.items?.map((item, itemIdx) => (
                  <li key={`${item}-${itemIdx}`} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {structuredSuggestions.reminders?.length > 0 && (
          <div className="rounded-lg border border-dashed bg-muted/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-info" />
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Final reminders
              </h4>
            </div>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              {structuredSuggestions.reminders.map((reminder, idx) => (
                <li key={`${reminder}-${idx}`}>{reminder}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  const hasOutdatedForecast = Boolean(
    cachedForecastSummary &&
    forecastSummary &&
    cachedForecastSummary !== forecastSummary
  )

  const allowRegenerate = hasOutdatedForecast && currentStatus === 'planned'

  const showRegenerateControls = Boolean(structuredSuggestions || rawSuggestions)

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Packing Suggestions</CardTitle>
        <p className="text-xs text-muted-foreground">
          Powered by Gemini.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!forecastSummary && (
          <p className="text-sm text-muted-foreground">
            Add or refresh weather forecasts to unlock tailored packing suggestions.
          </p>
        )}
        {error && (
          <p className="text-sm text-destructive">
            {error}
          </p>
        )}
        {hasOutdatedForecast && (
          <p className="text-xs text-info">
            Forecast changed since these suggestions were generated. Regenerate for the latest plan.
          </p>
        )}
        {structuredSuggestions
          ? renderStructured()
          : renderFallbackJson()}
        {!showRegenerateControls && (
          <div className="flex flex-col gap-2">
            <Button
              onClick={generateSuggestions}
              disabled={isLoading || !forecastSummary || currentStatus !== 'planned'}
              className={cn(
                "w-full sm:w-auto flex items-center justify-center gap-2",
                (isLoading || currentStatus !== 'planned') && "cursor-not-allowed"
              )}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? 'Generating…' : 'Generate packing list'}
            </Button>
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Crafting weather-aware tips…
              </div>
            )}
            {currentStatus !== 'planned' && (
              <p className="text-xs text-muted-foreground">
                Packing suggestions are available only before the trip commences.
              </p>
            )}
          </div>
        )}
        {showRegenerateControls && (
          <div className="space-y-2">
            <Button
              onClick={generateSuggestions}
              disabled={isLoading || !forecastSummary || !allowRegenerate || currentStatus !== 'planned'}
              className={cn(
                "w-full sm:w-auto flex items-center justify-center gap-2",
                (isLoading || !allowRegenerate || currentStatus !== 'planned') && "cursor-not-allowed"
              )}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? 'Regenerating…' : 'Regenerate suggestions'}
            </Button>
            {!allowRegenerate && currentStatus === 'planned' && (
              <p className="text-xs text-muted-foreground">
                If the forecast changes, you can regenerate the suggestions.
              </p>
            )}
            {currentStatus !== 'planned' && (
              <p className="text-xs text-muted-foreground">
                Trip already underway; suggestions can no longer be updated.
              </p>
            )}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Crafting fresh recommendations…
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

