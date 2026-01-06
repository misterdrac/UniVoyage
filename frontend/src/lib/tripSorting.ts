import type { Trip } from '@/types/trip'

export type TripSortOption = 'start-soonest' | 'start-latest'

export const DEFAULT_TRIP_SORT: TripSortOption = 'start-soonest'

const getDepartureTime = (trip: Trip) => new Date(trip.departureDate).getTime()
const getCreatedTime = (trip: Trip) => new Date(trip.createdAt).getTime()

const compareAscending = (a: Trip, b: Trip) => {
  const departureDiff = getDepartureTime(a) - getDepartureTime(b)
  if (departureDiff !== 0) {
    return departureDiff
  }

  const createdDiff = getCreatedTime(a) - getCreatedTime(b)
  if (createdDiff !== 0) {
    return createdDiff
  }

  return a.id - b.id
}

const compareDescending = (a: Trip, b: Trip) => compareAscending(b, a)

export const tripSortComparators: Record<TripSortOption, (a: Trip, b: Trip) => number> = {
  'start-soonest': compareAscending,
  'start-latest': compareDescending,
}

/**
 * Sorts trips by departure date (soonest or latest)
 */
export const sortTrips = (trips: Trip[], sortOption: TripSortOption): Trip[] => {
  const sortedTrips = [...trips]
  sortedTrips.sort(tripSortComparators[sortOption])
  return sortedTrips
}

