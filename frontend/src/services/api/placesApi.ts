import { API_CONFIG, type ApiResponse } from '@/config/api'
import type { ApiClient } from './baseClient'

export interface Place {
  id: string
  name: string
  category: string
  description?: string
  address?: string
  website?: string
  wikipedia?: string
  latitude?: number
  longitude?: number
}

export interface PlacesApi {
  searchPlaces(city: string, limit?: number): Promise<{ success: boolean; places?: Place[]; error?: string }>
}

export const placesApi: {
  [K in keyof PlacesApi]: (this: ApiClient, ...args: Parameters<PlacesApi[K]>) => ReturnType<PlacesApi[K]>
} = {
  async searchPlaces(this: ApiClient, city: string, limit = 10) {
    try {
      const params = new URLSearchParams({ city, limit: String(limit) })
      const res = await this.request<ApiResponse<{ places: Place[] }>>(
        `${API_CONFIG.ENDPOINTS.PLACES.SEARCH}?${params.toString()}`
      )

      if (res.success && res.data?.places) {
        return { success: true, places: res.data.places }
      }

      return { success: false, error: res.error ?? 'Failed to fetch places' }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Failed to fetch places' }
    }
  },
}
