import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { API_CONFIG } from '@/config/api'
import { useAuth } from '@/contexts/AuthContext'
import { calculateDurationInDays, formatDateLong } from '@/lib/dateUtils'
import type { TripStatus } from '@/lib/tripStatusUtils'
import { apiService } from '@/services/api'
import type { Trip } from '@/types/trip'
import type { NormalizedItinerary, StoredItineraryPayload } from '@/types/itinerary'
import { geminiClient, GEMINI_API_KEY, GEMINI_MODEL } from './utils/geminiClient'
import {
  buildGeminiPrompt,
  handleGeminiError,
  LOADING_STEPS,
  normalizeGeminiItinerary,
  type GeminiItinerary,
} from './utils/geminiItinerary'

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
    if (!user?.hobbies || !Array.isArray(user.hobbies)) {
      return []
    }

    return user.hobbies
      .map((hobby) => hobby?.name?.trim())
      .filter((name): name is string => Boolean(name && name.length > 0))
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
    async (
      payload: {
        structured: NormalizedItinerary | null
        raw: string | null
        signature?: string | null
      },
      options?: { skipRemote?: boolean }
    ) => {
      if (typeof window === 'undefined') return

      const snapshot: StoredItineraryPayload = {
        structured: payload.structured,
        raw: payload.raw,
        signature: payload.signature ?? fullSignature ?? null,
      }

      try {
        localStorage.setItem(storageKey, JSON.stringify(snapshot))
      } catch (err) {
        console.error('Failed to cache itinerary', err)
      }

      setCachedSignature(snapshot.signature ?? null)

      if (options?.skipRemote || API_CONFIG.USE_MOCK) return

      try {
        await apiService.saveTripItinerary(trip.id, snapshot)
      } catch (err) {
        console.error('Failed to sync itinerary to server', err)
      }
    },
    [fullSignature, storageKey, trip.id]
  )

  const normalizeItinerary = useCallback(
    (payload: GeminiItinerary | null): NormalizedItinerary | null => {
      return normalizeGeminiItinerary(payload, itineraryDates)
    },
    [itineraryDates]
  )

  const hydrateFromSnapshot = useCallback(
    (snapshot: StoredItineraryPayload | null) => {
      if (!snapshot) {
        setStructuredItinerary(null)
        setRawItinerary(null)
        setCachedSignature(null)
        return
      }

      if (snapshot.structured) {
        setStructuredItinerary(normalizeItinerary(snapshot.structured as unknown as GeminiItinerary))
        setRawItinerary(null)
      } else if (snapshot.raw) {
        setStructuredItinerary(null)
        setRawItinerary(snapshot.raw)
      } else {
        setStructuredItinerary(null)
        setRawItinerary(null)
      }

      setCachedSignature(snapshot.signature ?? null)
    },
    [normalizeItinerary]
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const cached = localStorage.getItem(storageKey)
    if (!cached) {
      hydrateFromSnapshot(null)
      return
    }
    try {
      const parsed = JSON.parse(cached) as StoredItineraryPayload
      hydrateFromSnapshot(parsed)
    } catch (err) {
      console.error('Failed to load cached itinerary', err)
    }
  }, [hydrateFromSnapshot, storageKey])

  useEffect(() => {
    if (API_CONFIG.USE_MOCK) return

    let isCancelled = false

    const fetchRemoteItinerary = async () => {
      try {
        const result = await apiService.getTripItinerary(trip.id)
        if (!result.success || !result.itinerary || isCancelled) return

        hydrateFromSnapshot(result.itinerary)
        await persistItinerary(
          {
            structured: result.itinerary.structured ?? null,
            raw: result.itinerary.raw ?? null,
            signature: result.itinerary.signature ?? null,
          },
          { skipRemote: true }
        )
      } catch (err) {
        console.error('Failed to fetch itinerary from server', err)
      }
    }

    fetchRemoteItinerary()

    return () => {
      isCancelled = true
    }
  }, [hydrateFromSnapshot, persistItinerary, trip.id])

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
    return buildGeminiPrompt({
      itineraryDates,
      locationLabel,
      departureDate: trip.departureDate,
      returnDate: trip.returnDate,
      userHobbies,
    })
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
          await persistItinerary({ structured: normalized, raw: null })
        } else {
          setStructuredItinerary(null)
          setRawItinerary(cleaned)
          await persistItinerary({ structured: null, raw: cleaned })
        }
      } catch {
        setStructuredItinerary(null)
        setRawItinerary(cleaned)
        await persistItinerary({ structured: null, raw: cleaned })
      }
    } catch (err) {
      const userMessage = handleGeminiError(err)
      setError(userMessage)
      toast.error(userMessage)
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

