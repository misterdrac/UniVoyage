import type { ApiClient } from './baseClient'
import { API_CONFIG } from '@/config/api'

export interface Hotel {
  hotelName: string
  hotelId: string
}

export interface HotelsApi {
  searchHotels(city: string, limit?: number): Promise<{ success: boolean; hotels?: Hotel[]; error?: string }>
  getHotelsStatus(): Promise<{ configured: boolean }>
}

export const hotelsApi: {
  [K in keyof HotelsApi]: (this: ApiClient, ...args: Parameters<HotelsApi[K]>) => ReturnType<HotelsApi[K]>
} = {
  async searchHotels(this: ApiClient, city: string, limit = 10): Promise<{ success: boolean; hotels?: Hotel[]; error?: string }> {
    try {
      const url = `${API_CONFIG.ENDPOINTS.HOTELS.SEARCH}?city=${encodeURIComponent(city)}&limit=${limit}`
      const response = await this.request<{ success: boolean; data?: { hotels: Hotel[] }; error?: string }>(url)

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
      const response = await this.request<{ success: boolean; data?: boolean }>(
        API_CONFIG.ENDPOINTS.HOTELS.STATUS
      )

      return {
        configured: response.success && response.data === true,
      }
    } catch {
      return { configured: false }
    }
  },
}

