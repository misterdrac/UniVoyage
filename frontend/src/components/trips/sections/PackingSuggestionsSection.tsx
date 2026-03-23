import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { ForecastDay } from '@/components/ui/weather-widget'
import type { TripStatus } from '@/lib/tripStatusUtils'
import { cn } from '@/lib/utils'
import { Loader2, Sparkles, AlertTriangle } from 'lucide-react'
import { apiService } from '@/services/api'

interface PackingSuggestionsSectionProps {
  tripId: number
  destinationName: string
  departureDate: string
  returnDate: string
  forecast: ForecastDay[] | null
  currentStatus: TripStatus
}

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
  const [packedItems, setPackedItems] = useState<Set<string>>(new Set())

  const storageKey = useMemo(() => `packing-suggestions-${tripId}`, [tripId])
  const packingStateKey = useMemo(() => `packing-${tripId}`, [tripId])

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

  const persistPackingState = useCallback(
    (items: Set<string>) => {
      if (typeof window === 'undefined') return
      try {
        localStorage.setItem(packingStateKey, JSON.stringify(Array.from(items)))
      } catch (err) {
        console.error('Failed to persist packing state', err)
      }
    },
    [packingStateKey]
  )

  const togglePackedItem = useCallback(
    (itemId: string) => {
      setPackedItems((prev) => {
        const updated = new Set(prev)
        if (updated.has(itemId)) {
          updated.delete(itemId)
        } else {
          updated.add(itemId)
        }
        persistPackingState(updated)
        return updated
      })
    },
    [persistPackingState]
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

  useEffect(() => {
    if (typeof window === 'undefined') return
    const cached = localStorage.getItem(packingStateKey)
    if (!cached) return
    try {
      const parsed = JSON.parse(cached) as string[]
      setPackedItems(new Set(parsed))
    } catch (err) {
      console.error('Failed to load packing state', err)
    }
  }, [packingStateKey])

  const generateSuggestions = useCallback(async () => {
    if (!forecastSummary) {
      setError("Packing advice will appear once a forecast is available.")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setStructuredSuggestions(null)
      setRawSuggestions(null)

      const response = await apiService.generatePackingSuggestions({
        destinationName,
        departureDate,
        returnDate,
        forecastSummary,
      })

      if (!response.success || !response.content) {
        setError(response.error || 'AI features are temporarily unavailable. Please try again later.')
        return
      }

      const cleaned = response.content
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
      console.error('[Packing Suggestions Error]', err)
      setError('Failed to generate packing suggestions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [forecastSummary, destinationName, departureDate, returnDate, persistSuggestions])

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

    // Calculate total items and packed count
    const totalItems = structuredSuggestions.categories.reduce((sum, cat) => sum + (cat.items?.length ?? 0), 0)
    const packedCount = Array.from(packedItems).filter(itemId => {
      const [, catIdx, itemIdx] = itemId.split('|')
      return catIdx && itemIdx
    }).length

    // Calculate progress percentage
    const progressPercentage = totalItems > 0 ? Math.round((packedCount / totalItems) * 100) : 0

    return (
      <div className="space-y-4">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary mt-0.5" />
          <p>{structuredSuggestions.summary}</p>
        </div>

        {/* Progress tracking */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-foreground">Packing Progress</span>
            <span className="text-sm text-muted-foreground">
              {packedCount}/{totalItems} packed
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {structuredSuggestions.categories.map((category, catIdx) => (
            <div
              key={`${category.title}-${catIdx}`}
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
              <div className="space-y-2">
                {category.items?.map((item, itemIdx) => {
                  const itemId = `${tripId}|${catIdx}|${itemIdx}`
                  const isPacked = packedItems.has(itemId)
                  return (
                    <div key={`${item}-${itemIdx}`} className="flex items-start gap-3">
                      <Checkbox
                        id={itemId}
                        checked={isPacked}
                        onCheckedChange={() => togglePackedItem(itemId)}
                        className="mt-1"
                      />
                      <label
                        htmlFor={itemId}
                        className={cn(
                          'text-sm text-muted-foreground cursor-pointer flex-1 leading-relaxed',
                          isPacked && 'line-through text-muted-foreground/50'
                        )}
                      >
                        {item}
                      </label>
                    </div>
                  )
                })}
              </div>
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

