export type WeatherType = 'clear' | 'clouds' | 'rain' | 'snow' | 'thunderstorm' | 'mist' | 'unknown'

export interface WeatherData {
  city: string
  temperature: number
  weatherType: WeatherType
  dateTime: string
  isDay: boolean
  timezoneOffsetSeconds?: number
}

export interface ForecastDay {
  date: string
  dateLabel: string
  temperature: {
    min: number
    max: number
  }
  weatherType: WeatherType
  description: string
  icon: string
}

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

export interface WeatherApiResponse {
  name: string
  main: {
    temp: number
  }
  weather: Array<{
    main: string
    icon: string
  }>
  timezone?: number
}

export interface WeatherWidgetProps {
  /**
   * Custom fetch function (optional)
   */
  onFetchWeather?: (lat: number, lng: number) => Promise<WeatherData>
  /**
   * Refresh interval in milliseconds (default: 15 minutes)
   */
  refreshInterval?: number
  /**
   * Width of the widget (default: 16rem/256px)
   */
  width?: string
  /**
   * Custom location coordinates (optional)
   */
  location?: {
    latitude: number
    longitude: number
  }
  /**
   * City name for current weather (alternative to coordinates)
   */
  cityName?: string
  /**
   * Location/country name (optional)
   */
  locationName?: string
  /**
   * Fallback location coordinates if geolocation fails
   */
  fallbackLocation?: {
    latitude: number
    longitude: number
  }
  /**
   * Custom CSS class for the card
   */
  className?: string
  /**
   * Callback when weather data is loaded
   */
  onWeatherLoaded?: (data: WeatherData) => void
  /**
   * Callback when forecast data is loaded (forecast mode only)
   */
  onForecastLoaded?: (days: ForecastDay[]) => void
  /**
   * Callback on error
   */
  onError?: (error: string) => void
  /**
   * Enable/disable animations (default: true)
   */
  animated?: boolean
  /**
   * Forecast mode: show forecast for trip dates instead of current weather
   */
  forecastMode?: {
    cityName: string
    locationName?: string
    departureDate: string
    returnDate: string
  }
}

export interface ForecastCachePayload {
  days: ForecastDay[]
  timezoneOffsetSeconds?: number
}

