import { useCallback, useEffect, useState } from 'react'
import { apiService } from '@/services/api'
import type { TripCurrencyInfo } from '@/types/trip'

export function useTripCurrency(tripId: number | null | undefined) {
  const [data, setData] = useState<TripCurrencyInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (tripId == null) {
      setData(null)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const res = await apiService.getTripCurrency(tripId)
      if (res.success && res.currency) {
        setData(res.currency)
      } else {
        setData(null)
        setError(res.error ?? 'Failed to load currency')
      }
    } catch (e: unknown) {
      setData(null)
      setError(e instanceof Error ? e.message : 'Failed to load currency')
    } finally {
      setIsLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, isLoading, error, refetch }
}
