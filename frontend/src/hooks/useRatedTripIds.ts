import { useEffect, useState } from 'react'
import { apiService } from '@/services/api'
import type { Trip } from '@/types/trip'
import { calculateTripStatus } from '@/lib/tripUtils'

/**
 * Fetches which completed trips the current user has already rated.
 * Returns a Set of trip IDs that have been rated.
 */
export function useRatedTripIds(trips: Trip[]) {
  const [ratedTripIds, setRatedTripIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    const completedTrips = trips.filter(
      (trip) => calculateTripStatus(trip.departureDate, trip.returnDate) === 'completed'
    )

    if (!completedTrips.length) return

    let isMounted = true

    const fetchRatings = async () => {
      const results = await Promise.allSettled(
        completedTrips.map((trip) => apiService.getTripRating(trip.id))
      )

      if (!isMounted) return

      const rated = new Set<number>()
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.rating) {
          rated.add(completedTrips[index].id)
        }
      })

      setRatedTripIds(rated)
    }

    fetchRatings()
    return () => { isMounted = false }
  }, [trips])

  return ratedTripIds
}
