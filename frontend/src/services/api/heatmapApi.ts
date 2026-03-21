import { API_CONFIG } from '@/config/apiConfig'
import type { ApiClient } from './baseClient'

/**
 * Raw heatmap row from GET /api/heatmap (matches HeatmapPointDto on backend).
 */
export interface HeatmapPointRaw {
  destinationName: string
  destinationLocation: string
  tripCount: number
}

/**
 * Heatmap API — aggregated trip counts per destination (public landing page).
 */
export interface HeatmapApi {
  /**
   * Returns heatmap rows; coordinates are resolved client-side (geocoding).
   */
  getHeatmapPoints(): Promise<{ success: boolean; points?: HeatmapPointRaw[]; error?: string }>
}

export const heatmapApi: {
  [K in keyof HeatmapApi]: (
    this: ApiClient,
    ...args: Parameters<HeatmapApi[K]>
  ) => ReturnType<HeatmapApi[K]>
} = {
  async getHeatmapPoints(this: ApiClient) {
    try {
      const res = await this.request<{ points: HeatmapPointRaw[] }>(
        API_CONFIG.ENDPOINTS.HEATMAP.GET,
        { method: 'GET' },
      )

      if (res.success && res.data) {
        return { success: true, points: res.data.points ?? [] }
      }

      return { success: false, error: res.error ?? 'Failed to fetch heatmap data' }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch heatmap data'
      return { success: false, error: message }
    }
  },
}
