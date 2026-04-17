import { API_CONFIG } from '@/config/apiConfig'
import type { Destination, } from '@/types/destination'
import type { DestinationReview, DestinationReviewsPage } from '@/types/trip'
import type { ApiClient } from './baseClient'

/**
 * Backend destination response format
 * Matches the structure returned by the API
 */
export interface BackendDestinationResponse {
  id: number
  title: string
  location: string
  continent?: string
  imageUrl?: string
  imageAlt?: string
  overview?: string
  budgetPerDay?: number
  whyVisit?: string
  studentPerks?: string[]
  /** 0–5, one decimal; omitted or null if not set */
  averageRating?: number | null
  /** From submitted trip ratings; null when no traveller ratings yet. */
  travellerRatingAverage?: number | null
  travellerRatingCount?: number | null
}

/**
 * Destinations API interface
 * Handles destination retrieval and search
 */
export interface DestinationsApi {
  /**
   * Retrieves all available destinations
   * @returns Promise resolving to success status and array of destinations
   */
  getDestinations(): Promise<{ success: boolean; destinations?: Destination[]; error?: string }>
  
  /**
   * Searches destinations by query string
   * @param query - Search query to match against destination names and locations
   * @returns Promise resolving to success status and array of matching destinations
   */
  searchDestinations(query: string): Promise<{ success: boolean; destinations?: Destination[]; error?: string }>

  /**
   * Retrieves published (approved) reviews for a destination
   * @param destinationId - ID of the destination
   * @param page - Page number (0-based)
   * @param size - Page size
   */
  getDestinationReviews(destinationId: number, page?: number, size?: number): Promise<{ success: boolean; reviews?: DestinationReviewsPage; error?: string }>
}

/**
 * Maps backend destination response to frontend Destination interface
 * @param backendDest - Destination data from backend API
 * @returns Frontend Destination object
 */
function mapBackendDestination(backendDest: BackendDestinationResponse): Destination {
  return {
    id: backendDest.id,
    title: backendDest.title,
    location: backendDest.location,
    continent: backendDest.continent,
    imageUrl: backendDest.imageUrl,
    imageAlt: backendDest.imageAlt,
    overview: backendDest.overview,
    budgetPerDay: backendDest.budgetPerDay,
    whyVisit: backendDest.whyVisit,
    studentPerks: backendDest.studentPerks,
    averageRating:
      backendDest.averageRating !== undefined && backendDest.averageRating !== null
        ? Number(backendDest.averageRating)
        : undefined,
    travellerRatingAverage:
      backendDest.travellerRatingAverage !== undefined && backendDest.travellerRatingAverage !== null
        ? Number(backendDest.travellerRatingAverage)
        : undefined,
  }
}

export const destinationsApi: { 
  [K in keyof DestinationsApi]: (
    this: ApiClient, 
    ...args: Parameters<DestinationsApi[K]>
  ) => ReturnType<DestinationsApi[K]> 
} = {
  async getDestinations(this: ApiClient) {
    try {
      const res = await this.request<{ destinations: BackendDestinationResponse[] }>(
        API_CONFIG.ENDPOINTS.DESTINATIONS.GET_ALL,
        {
          method: 'GET',
        }
      )

      if (res.success && res.data?.destinations) {
        const destinations = res.data.destinations.map(mapBackendDestination)
        return { success: true, destinations }
      }

      return { success: false, error: res.error ?? 'Failed to fetch destinations' }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Failed to fetch destinations' }
    }
  },

  async searchDestinations(this: ApiClient, query: string) {
    try {
      const res = await this.request<{ destinations: BackendDestinationResponse[] }>(
        `${API_CONFIG.ENDPOINTS.DESTINATIONS.SEARCH}?query=${encodeURIComponent(query)}`,
        {
          method: 'GET',
        }
      )

      if (res.success && res.data?.destinations) {
        const destinations = res.data.destinations.map(mapBackendDestination)
        return { success: true, destinations }
      }

      return { success: false, error: res.error ?? 'Failed to search destinations' }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Failed to search destinations' }
    }
  },

  async getDestinationReviews(this: ApiClient, destinationId, page = 0, size = 10) {
    try {
      const res = await this.request<{ reviews: DestinationReviewsPage }>(
        `${API_CONFIG.ENDPOINTS.DESTINATIONS.REVIEWS}/${destinationId}/reviews?page=${page}&size=${size}`
      )

      if (res.success && res.data?.reviews) {
        return { success: true, reviews: res.data.reviews }
      }

      return { success: false, error: res.error ?? 'Failed to fetch reviews' }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Failed to fetch reviews' }
    }
  },
}

