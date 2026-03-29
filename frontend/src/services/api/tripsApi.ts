import { API_CONFIG } from '@/config/apiConfig'
import type { StoredItineraryPayload } from '@/types/itinerary'
import type { TripBudgetPayload } from '@/types/budget'
import type { TripCurrencyInfo } from '@/types/trip'
import type { ApiClient } from './baseClient'

/**
 * Trips API interface
 * Handles trip creation, retrieval, deletion, and related data (budget, accommodation)
 */
export interface TripsApi {
  /**
   * Creates a new trip
   * @param data - Trip creation data including destination and dates
   * @returns Promise resolving to success status and created trip data
   */
  createTrip(data: {
    destinationId: number
    destinationName: string
    destinationLocation: string
    departureDate: string
    returnDate: string
  }): Promise<{ success: boolean; trip?: any; error?: string }>
  
  /**
   * Retrieves all trips for the authenticated user
   * @returns Promise resolving to success status and array of trips
   */
  getTrips(): Promise<{ success: boolean; trips?: any[]; error?: string }>
  
  /**
   * Deletes a trip by ID
   * @param tripId - ID of the trip to delete
   * @returns Promise resolving to success status
   */
  deleteTrip(tripId: number): Promise<{ success: boolean; error?: string }>
  
  /**
   * Retrieves budget data for a specific trip
   * @param tripId - ID of the trip
   * @returns Promise resolving to success status and budget payload
   */
  getTripBudget(tripId: number): Promise<{ success: boolean; budget?: TripBudgetPayload; error?: string }>
  
  /**
   * Saves budget data for a specific trip
   * @param tripId - ID of the trip
   * @param payload - Budget data to save
   * @returns Promise resolving to success status
   */
  saveTripBudget(tripId: number, payload: TripBudgetPayload): Promise<{ success: boolean; error?: string }>
  
  /**
   * Retrieves accommodation information for a specific trip
   * @param tripId - ID of the trip
   * @returns Promise resolving to success status and accommodation data
   */
  getTripAccommodation(tripId: number): Promise<{ 
    success: boolean
    accommodation?: {
      accommodationName?: string
      accommodationAddress?: string
      accommodationPhone?: string
    }
    error?: string 
  }>
  
  /**
   * Saves accommodation information for a specific trip
   * @param tripId - ID of the trip
   * @param data - Accommodation data to save
   * @returns Promise resolving to success status
   */
  saveTripAccommodation(tripId: number, data: {
    accommodationName?: string
    accommodationAddress?: string
    accommodationPhone?: string
  }): Promise<{ success: boolean; error?: string }>

  /**
   * Destination currency and exchange rate vs the user's home currency (from profile)
   */
  getTripCurrency(tripId: number): Promise<{ success: boolean; currency?: TripCurrencyInfo; error?: string }>
}

/**
 * Itinerary API interface
 * Handles trip itinerary generation and storage
 */
export interface ItineraryApi {
  /**
   * Retrieves itinerary data for a specific trip
   * @param tripId - ID of the trip
   * @returns Promise resolving to success status and itinerary payload
   */
  getTripItinerary(tripId: number): Promise<{ success: boolean; itinerary?: StoredItineraryPayload; error?: string }>
  
  /**
   * Saves itinerary data for a specific trip
   * @param tripId - ID of the trip
   * @param payload - Itinerary data to save
   * @returns Promise resolving to success status
   */
  saveTripItinerary(tripId: number, payload: StoredItineraryPayload): Promise<{ success: boolean; error?: string }>
}

export const tripsApi: { [K in keyof TripsApi]: (this: ApiClient, ...args: Parameters<TripsApi[K]>) => ReturnType<TripsApi[K]> } = {
  async createTrip(this: ApiClient, data) {
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

  async getTripBudget(this: ApiClient, tripId) {
    try {
      const res = await this.request<{ budget?: TripBudgetPayload }>(
        `${API_CONFIG.ENDPOINTS.TRIPS.GET_BY_ID}/${tripId}/budget`
      )

      if (res.success) {
        return { success: true, budget: res.data?.budget }
      }

      return { success: false, error: res.error ?? 'Failed to load trip budget' }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Failed to load trip budget' }
    }
  },

  async saveTripBudget(this: ApiClient, tripId, payload) {
    try {
      const res = await this.request<{ success: boolean }>(
        `${API_CONFIG.ENDPOINTS.TRIPS.UPDATE}/${tripId}/budget`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      if (res.success) {
        return { success: true }
      }

      return { success: false, error: res.error ?? 'Failed to save trip budget' }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Failed to save trip budget' }
    }
  },

  async getTripAccommodation(this: ApiClient, tripId) {
    try {
      const res = await this.request<{ accommodation?: { accommodationName?: string; accommodationAddress?: string; accommodationPhone?: string } }>(
        `${API_CONFIG.ENDPOINTS.TRIPS.GET_BY_ID}/${tripId}/accommodation`
      )

      if (res.success) {
        return { success: true, accommodation: res.data?.accommodation }
      }

      return { success: false, error: res.error ?? 'Failed to load accommodation' }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Failed to load accommodation' }
    }
  },

  async saveTripAccommodation(this: ApiClient, tripId, data) {
    try {
      const res = await this.request<{ success: boolean }>(
        `${API_CONFIG.ENDPOINTS.TRIPS.UPDATE}/${tripId}/accommodation`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      )

      if (res.success) {
        return { success: true }
      }

      return { success: false, error: res.error ?? 'Failed to save accommodation' }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Failed to save accommodation' }
    }
  },

  async getTripCurrency(this: ApiClient, tripId) {
    try {
      const res = await this.request<{ currency?: TripCurrencyInfo }>(
        `${API_CONFIG.ENDPOINTS.TRIPS.GET_BY_ID}/${tripId}/currency`
      )

      if (res.success && res.data?.currency) {
        const c = res.data.currency
        return {
          success: true,
          currency: {
            destinationCurrencyCode: c.destinationCurrencyCode,
            destinationCurrencyName: c.destinationCurrencyName,
            baseCurrencyCode: c.baseCurrencyCode,
            exchangeRate: Number(c.exchangeRate),
          },
        }
      }

      return { success: false, error: res.error ?? 'Failed to load currency' }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Failed to load currency' }
    }
  },
}

export const itineraryApi: { [K in keyof ItineraryApi]: (this: ApiClient, ...args: Parameters<ItineraryApi[K]>) => ReturnType<ItineraryApi[K]> } =
  {
    async getTripItinerary(this: ApiClient, tripId) {
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


