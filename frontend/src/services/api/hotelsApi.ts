import type { ApiClient } from './baseClient'
import { API_CONFIG } from '@/config/apiConfig'

/**
 * Hotel data structure
 */
export interface Hotel {
  hotelName: string
  hotelId: string
}

/**
 * Hotels API interface
 * Handles hotel search and status checking
 */
export interface HotelsApi {
  /**
   * Searches for hotels in a city
   * @param city - City name to search in
   * @param limit - Maximum number of results to return (default: 10)
   * @returns Promise resolving to success status and array of hotels
   * @returns Error code 'NO_HOTELS_FOUND' if no hotels are available
   */
  searchHotels(city: string, limit?: number): Promise<{ success: boolean; hotels?: Hotel[]; error?: string }>
  
  /**
   * Checks if hotel search features are configured and available
   * @returns Promise resolving to configuration status
   */
  getHotelsStatus(): Promise<{ configured: boolean }>
}

export const hotelsApi: {
  [K in keyof HotelsApi]: (this: ApiClient, ...args: Parameters<HotelsApi[K]>) => ReturnType<HotelsApi[K]>
} = {
  async searchHotels(this: ApiClient, city: string, limit = 10): Promise<{ success: boolean; hotels?: Hotel[]; error?: string }> {
    try {
      const url = `${API_CONFIG.ENDPOINTS.HOTELS.SEARCH}?city=${encodeURIComponent(city)}&limit=${limit}`
      const response = await this.request<{ hotels: Hotel[] }>(url)

      if (response.success && response.data?.hotels) {
        return {
          success: true,
          hotels: response.data.hotels,
        }
      }

      const errorMsg = response.error || 'Failed to fetch hotels'
      if (errorMsg.includes('NOTHING FOUND') || errorMsg.includes('Nothing found')) {
        return {
          success: false,
          error: 'NO_HOTELS_FOUND',
        }
      }

      return {
        success: false,
        error: errorMsg,
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('NOTHING FOUND') || errorMessage.includes('Nothing found')) {
        return {
          success: false,
          error: 'NO_HOTELS_FOUND',
        }
      }
      
      return {
        success: false,
        error: 'Failed to fetch hotels. Please try again later.',
      }
    }
  },

  async getHotelsStatus(this: ApiClient): Promise<{ configured: boolean }> {
    try {
      const response = await this.request<boolean>(
        API_CONFIG.ENDPOINTS.HOTELS.STATUS
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

