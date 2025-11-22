import type { Trip } from '@/types/trip'
import { calculateTripStatus } from './tripUtils'
import { DEFAULT_TRIP_SORT, type TripSortOption } from './tripSorting'

export type TripStatusFilter = 'all' | 'planned' | 'ongoing' | 'completed'

export interface TripFilters {
  status: TripStatusFilter
  sort: TripSortOption
}

export const DEFAULT_TRIP_FILTERS: TripFilters = {
  status: 'all',
  sort: DEFAULT_TRIP_SORT,
}

export const filterTripsByStatus = (trips: Trip[], status: TripStatusFilter): Trip[] => {
  if (status === 'all') {
    return trips
  }

  return trips.filter(
    (trip) => calculateTripStatus(trip.departureDate, trip.returnDate) === status
  )
}

export const filterTrips = (trips: Trip[], filters: TripFilters): Trip[] => {
  return filterTripsByStatus(trips, filters.status)
}

export const hasActiveTripFilters = (filters: TripFilters): boolean => {
  return filters.status !== DEFAULT_TRIP_FILTERS.status || filters.sort !== DEFAULT_TRIP_FILTERS.sort
}

