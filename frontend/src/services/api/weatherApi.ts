import { API_CONFIG } from '@/config/apiConfig'
import type { ApiClient } from './baseClient'

/**
 * Current weather data structure
 */
export interface WeatherData {
  city: string
  temperature: number
  weatherType: 'clear' | 'clouds' | 'rain' | 'snow' | 'thunderstorm' | 'mist' | 'unknown'
  dateTime: string
  isDay: boolean
  timezoneOffsetSeconds?: number
}

/**
 * Weather forecast API response structure
 * Contains 5-day forecast data from OpenWeatherMap
 */
export interface ForecastApiResponse {
  list: Array<{
    dt: number
    main: {
      temp_min: number
      temp_max: number
      temp: number
    }
    weather: Array<{
      main: string
      description: string
      icon: string
    }>
    dt_txt: string
  }>
  city: {
    name: string
    timezone?: number
  }
}

/**
 * Weather API interface
 * Handles current weather and forecast data retrieval
 */
export interface WeatherApi {
  /**
   * Retrieves current weather for a city
   * @param city - City name
   * @param country - Optional country code for more accurate results
   * @returns Promise resolving to success status and weather data
   */
  getCurrentWeather(city: string, country?: string): Promise<{ success: boolean; weather?: WeatherData; error?: string }>
  
  /**
   * Retrieves current weather by geographic coordinates
   * @param lat - Latitude coordinate
   * @param lon - Longitude coordinate
   * @returns Promise resolving to success status and weather data
   */
  getCurrentWeatherByCoordinates(lat: number, lon: number): Promise<{ success: boolean; weather?: WeatherData; error?: string }>
  
  /**
   * Retrieves 5-day weather forecast for a city
   * @param city - City name
   * @param country - Optional country code for more accurate results
   * @returns Promise resolving to success status and forecast data
   */
  getForecast(city: string, country?: string): Promise<{ success: boolean; forecast?: ForecastApiResponse; error?: string }>
}

export const weatherApi: {
  [K in keyof WeatherApi]: (
    this: ApiClient,
    ...args: Parameters<WeatherApi[K]>
  ) => ReturnType<WeatherApi[K]>
} = {
  async getCurrentWeather(this: ApiClient, city: string, country?: string) {
    try {
      const params = new URLSearchParams({ city })
      if (country) {
        params.append('country', country)
      }
      const res = await this.request<{ weather: WeatherData }>(
        `${API_CONFIG.ENDPOINTS.WEATHER.CURRENT}?${params.toString()}`
      )

      if (res.success && res.data?.weather) {
        return { success: true, weather: res.data.weather }
      }

      return { success: false, error: res.error ?? 'Failed to fetch weather' }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Failed to fetch weather' }
    }
  },

  async getCurrentWeatherByCoordinates(this: ApiClient, lat: number, lon: number) {
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
      })
      const res = await this.request<{ weather: WeatherData }>(
        `${API_CONFIG.ENDPOINTS.WEATHER.CURRENT}?${params.toString()}`
      )

      if (res.success && res.data?.weather) {
        return { success: true, weather: res.data.weather }
      }

      return { success: false, error: res.error ?? 'Failed to fetch weather' }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Failed to fetch weather' }
    }
  },

  async getForecast(this: ApiClient, city: string, country?: string) {
    try {
      const params = new URLSearchParams({ city })
      if (country) {
        params.append('country', country)
      }
      const res = await this.request<ForecastApiResponse>(
        `${API_CONFIG.ENDPOINTS.WEATHER.FORECAST}?${params.toString()}`
      )

      if (res.success && res.data) {
        return { success: true, forecast: res.data }
      }

      return { success: false, error: res.error ?? 'Failed to fetch forecast' }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Failed to fetch forecast' }
    }
  },
}

