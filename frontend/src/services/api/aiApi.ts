import type { ApiClient } from './baseClient'
import { API_CONFIG } from '@/config/apiConfig'

/**
 * Date information for itinerary generation
 */
export interface ItineraryDateInfo {
  iso: string
  label: string
}

/**
 * Request payload for AI itinerary generation
 */
export interface ItineraryRequest {
  locationLabel: string
  departureDate: string
  returnDate: string
  itineraryDates: ItineraryDateInfo[]
  userHobbies?: string[]
}

/**
 * Request payload for AI packing suggestions generation
 */
export interface PackingRequest {
  destinationName: string
  departureDate: string
  returnDate: string
  forecastSummary: string
}

/**
 * Response structure from Gemini AI API
 */
export interface GeminiApiResponse {
  success: boolean
  content?: string
  error?: string
}

/**
 * AI API interface
 * Handles AI-powered features like itinerary and packing suggestions generation
 */
export interface AiApi {
  /**
   * Generates AI-powered travel itinerary
   * Uses Gemini AI to create a day-by-day itinerary based on trip details
   * @param request - Itinerary generation request with location, dates, and user preferences
   * @returns Promise resolving to AI response with generated content
   */
  generateItinerary(request: ItineraryRequest): Promise<GeminiApiResponse>
  
  /**
   * Generates AI-powered packing suggestions
   * Uses Gemini AI to suggest items to pack based on destination and weather
   * @param request - Packing suggestions request with destination and forecast data
   * @returns Promise resolving to AI response with generated content
   */
  generatePackingSuggestions(request: PackingRequest): Promise<GeminiApiResponse>
  
  /**
   * Checks if AI features are configured and available
   * @returns Promise resolving to configuration status
   */
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
        const data: { success: boolean; content?: string; error?: string } = response.data
        return {
          success: data.success,
          content: data.content,
          error: data.error,
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
        const data: { success: boolean; content?: string; error?: string } = response.data
        return {
          success: data.success,
          content: data.content,
          error: data.error,
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
      const response = await this.request<boolean>(
        API_CONFIG.ENDPOINTS.AI.STATUS
      )

      if (response.success && response.data !== undefined) {
        return {
          configured: response.data === true,
        }
      }
      return { configured: false }
    } catch {
      return { configured: false }
    }
  },
}

