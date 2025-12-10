import { API_CONFIG } from '@/config/api'
import { API_CONSTANTS } from '@/lib/constants'
import type { StoredItineraryPayload } from '@/types/itinerary'
import type { User } from '@/types/user'
import type { ApiClient } from './baseClient'

export interface TripsApi {
  createTrip(data: {
    destinationId: number
    destinationName: string
    destinationLocation: string
    departureDate: string
    returnDate: string
  }): Promise<{ success: boolean; trip?: any; error?: string }>
  getTrips(): Promise<{ success: boolean; trips?: any[]; error?: string }>
  deleteTrip(tripId: number): Promise<{ success: boolean; error?: string }>
}

export interface ItineraryApi {
  getTripItinerary(tripId: number): Promise<{ success: boolean; itinerary?: StoredItineraryPayload; error?: string }>
  saveTripItinerary(tripId: number, payload: StoredItineraryPayload): Promise<{ success: boolean; error?: string }>
}

export const tripsApi: { [K in keyof TripsApi]: (this: ApiClient, ...args: Parameters<TripsApi[K]>) => ReturnType<TripsApi[K]> } = {
  async createTrip(this: ApiClient, data) {
    if (this.useMock) {
      try {
        const savedUser = localStorage.getItem(API_CONSTANTS.USER_KEY)
        if (!savedUser) {
          return { success: false, error: 'User not found' }
        }

        const user = JSON.parse(savedUser) as User
        const trips = this.getMockTrips()

        const newTrip = {
          id: trips.length > 0 ? Math.max(...trips.map((t: any) => t.id)) + 1 : 1,
          userId: user.id,
          destinationId: data.destinationId,
          destinationName: data.destinationName,
          destinationLocation: data.destinationLocation,
          departureDate: data.departureDate,
          returnDate: data.returnDate,
          createdAt: new Date().toISOString(),
          status: 'planned' as const,
        }

        trips.push(newTrip)
        localStorage.setItem('mock_trips', JSON.stringify(trips))

        return { success: true, trip: newTrip }
      } catch (err: any) {
        return { success: false, error: err?.message ?? 'Trip creation failed' }
      }
    }

    try {
      const res = await this.request<{ success: boolean; trip: any }>(API_CONFIG.ENDPOINTS.TRIPS.CREATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.success && res.data?.trip) {
        return { success: true, trip: res.data.trip }
      }

      return { success: false, error: res.error ?? 'Trip creation failed' }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Trip creation failed' }
    }
  },

  async getTrips(this: ApiClient) {
    if (this.useMock) {
      try {
        const savedUser = localStorage.getItem(API_CONSTANTS.USER_KEY)
        if (!savedUser) {
          return { success: false, error: 'User not found' }
        }

        const user = JSON.parse(savedUser) as User
        const trips = this.getMockTrips()
        const userTrips = trips.filter((trip: any) => trip.userId === user.id)

        return { success: true, trips: userTrips }
      } catch (err: any) {
        return { success: false, error: err?.message ?? 'Failed to fetch trips' }
      }
    }

    try {
      const res = await this.request<{ success: boolean; trips: any[] }>(API_CONFIG.ENDPOINTS.TRIPS.GET_ALL)

      if (res.success && res.data?.trips) {
        return { success: true, trips: res.data.trips }
      }

      return { success: false, error: res.error ?? 'Failed to fetch trips' }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Failed to fetch trips' }
    }
  },

  async deleteTrip(this: ApiClient, tripId) {
    if (this.useMock) {
      try {
        const savedUser = localStorage.getItem(API_CONSTANTS.USER_KEY)
        if (!savedUser) {
          return { success: false, error: 'User not found' }
        }

        const user = JSON.parse(savedUser) as User
        const trips = this.getMockTrips()
        const tripIndex = trips.findIndex((t: any) => t.id === tripId && t.userId === user.id)

        if (tripIndex === -1) {
          return { success: false, error: 'Trip not found' }
        }

        trips.splice(tripIndex, 1)
        localStorage.setItem('mock_trips', JSON.stringify(trips))

        return { success: true }
      } catch (err: any) {
        return { success: false, error: err?.message ?? 'Trip deletion failed' }
      }
    }

    try {
      const res = await this.request<{ success: boolean }>(`${API_CONFIG.ENDPOINTS.TRIPS.DELETE}/${tripId}`, {
        method: 'DELETE',
      })

      if (res.success) {
        return { success: true }
      }

      return { success: false, error: res.error ?? 'Trip deletion failed' }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Trip deletion failed' }
    }
  },
}

export const itineraryApi: { [K in keyof ItineraryApi]: (this: ApiClient, ...args: Parameters<ItineraryApi[K]>) => ReturnType<ItineraryApi[K]> } =
  {
    async getTripItinerary(this: ApiClient, tripId) {
      if (this.useMock) {
        try {
          const cached = localStorage.getItem(`trip-itinerary-${tripId}`)
          if (!cached) {
            return { success: true }
          }
          const parsed = JSON.parse(cached) as StoredItineraryPayload
          return { success: true, itinerary: parsed }
        } catch (err: any) {
          return { success: false, error: err?.message ?? 'Failed to load itinerary' }
        }
      }

      try {
        const res = await this.request<{ itinerary?: StoredItineraryPayload }>(
          `${API_CONFIG.ENDPOINTS.TRIPS.GET_BY_ID}/${tripId}/itinerary`
        )

        if (res.success) {
          return { success: true, itinerary: res.data?.itinerary }
        }

        return { success: false, error: res.error ?? 'Failed to load itinerary' }
      } catch (err: any) {
        return { success: false, error: err?.message ?? 'Failed to load itinerary' }
      }
    },

    async saveTripItinerary(this: ApiClient, tripId, payload) {
      if (this.useMock) {
        try {
          localStorage.setItem(`trip-itinerary-${tripId}`, JSON.stringify(payload))
          return { success: true }
        } catch (err: any) {
          return { success: false, error: err?.message ?? 'Failed to save itinerary' }
        }
      }

      try {
        const res = await this.request<{ itinerary?: StoredItineraryPayload }>(
          `${API_CONFIG.ENDPOINTS.TRIPS.UPDATE}/${tripId}/itinerary`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        )

        if (res.success) {
          return { success: true }
        }

        return { success: false, error: res.error ?? 'Failed to save itinerary' }
      } catch (err: any) {
        return { success: false, error: err?.message ?? 'Failed to save itinerary' }
      }
    },
  }


