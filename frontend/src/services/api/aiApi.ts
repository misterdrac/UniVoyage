import type { ApiClient } from './baseClient'
import { API_CONFIG } from '@/config/apiConfig'

export interface ItineraryDateInfo {
  iso: string
  label: string
}

export interface ItineraryRequest {
  locationLabel: string
  departureDate: string
  returnDate: string
  itineraryDates: ItineraryDateInfo[]
  userHobbies?: string[]
}

export interface PackingRequest {
  destinationName: string
  departureDate: string
  returnDate: string
  forecastSummary: string
}

export interface GeminiApiResponse {
  success: boolean
  content?: string
  error?: string
}

export interface AiApi {
  generateItinerary(request: ItineraryRequest): Promise<GeminiApiResponse>
  generatePackingSuggestions(request: PackingRequest): Promise<GeminiApiResponse>
  getAiStatus(): Promise<{ configured: boolean }>
}

export const aiApi: {
  [K in keyof AiApi]: (this: ApiClient, ...args: Parameters<AiApi[K]>) => ReturnType<AiApi[K]>
} = {
  async generateItinerary(this: ApiClient, request: ItineraryRequest): Promise<GeminiApiResponse> {
    try {
      const response = await this.request<{ success: boolean; data?: { success: boolean; content?: string; error?: string }; error?: string }>(
        API_CONFIG.ENDPOINTS.AI.ITINERARY,
        {
          method: 'POST',
          body: JSON.stringify(request),
        }
      )

      if (response.success && response.data) {
        return {
          success: response.data.success,
          content: response.data.content,
          error: response.data.error,
        }
      }

      return {
        success: false,
        error: response.error || 'AI features are temporarily unavailable. Please try again later.',
      }
    } catch (error: unknown) {
      console.error('Error generating itinerary:', error)
      return {
        success: false,
        error: 'AI features are temporarily unavailable. Please try again later.',
      }
    }
  },

  async generatePackingSuggestions(this: ApiClient, request: PackingRequest): Promise<GeminiApiResponse> {
    try {
      const response = await this.request<{ success: boolean; data?: { success: boolean; content?: string; error?: string }; error?: string }>(
        API_CONFIG.ENDPOINTS.AI.PACKING,
        {
          method: 'POST',
          body: JSON.stringify(request),
        }
      )

      if (response.success && response.data) {
        return {
          success: response.data.success,
          content: response.data.content,
          error: response.data.error,
        }
      }

      return {
        success: false,
        error: response.error || 'AI features are temporarily unavailable. Please try again later.',
      }
    } catch (error: unknown) {
      console.error('Error generating packing suggestions:', error)
      return {
        success: false,
        error: 'AI features are temporarily unavailable. Please try again later.',
      }
    }
  },

  async getAiStatus(this: ApiClient): Promise<{ configured: boolean }> {
    try {
      const response = await this.request<{ success: boolean; data?: boolean }>(
        API_CONFIG.ENDPOINTS.AI.STATUS
      )

      return {
        configured: response.success && response.data === true,
      }
    } catch {
      return { configured: false }
    }
  },
}

