import { API_CONFIG, type ApiResponse, type AuthResponse, ApiError } from '@/config/apiConfig'
import { API_CONSTANTS, COUNTRIES, LANGUAGES, TRAVEL_INTERESTS } from '@/lib/constants'
import type { User, CountryDto, HobbyDto, LanguageDto, VisitedCountryDto } from '@/types/user'
import type { BackendUserDto } from './types'

/**
 * Base HTTP client for API communication
 * Handles authentication, request/response processing, and data transformation
 */
export class ApiClient {
  /** Base URL for all API requests */
  public baseURL: string

  /**
   * Creates a new ApiClient instance
   * Initializes with the base URL from API configuration
   */
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
  }

  /**
   * Adapts backend user DTO to frontend User type
   * Handles date conversion and ensures all fields are properly formatted
   * @param user - Backend user DTO from API
   * @returns Frontend User object or undefined if user is not provided
   */
  public adaptUserDto(user?: BackendUserDto): User | undefined {
    if (!user) {
      return undefined
    }


    const visitedCountries: VisitedCountryDto[] = (user.visitedCountries ?? []).map((vc) => ({
      ...vc,
      dateOfVisit: typeof vc.dateOfVisit === 'string' ? vc.dateOfVisit : (vc.dateOfVisit ? new Date(vc.dateOfVisit).toISOString() : new Date().toISOString()),
    }))

    return {
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      role: user.role,
      countryOfOrigin: user.countryOfOrigin,
      hobbies: user.hobbies ?? [],
      languages: user.languages ?? [],
      visitedCountries,
      profileImagePath: user.profileImagePath,
      dateOfRegister: user.dateOfRegister,
      dateOfLastSignin: user.dateOfLastSignin,
    }
  }

  /**
   * Adapts authentication response payload from backend format to frontend format
   * Converts backend user DTO to frontend User type
   * @param payload - Authentication response from backend
   * @returns Adapted authentication response with frontend User type
   */
  public adaptAuthPayload(payload?: AuthResponse<BackendUserDto>): AuthResponse<User> {
    if (!payload) {
      return { success: false, error: 'Missing auth payload' }
    }

    return {
      success: payload.success,
      token: payload.token,
      csrfToken: payload.csrfToken,
      error: payload.error,
      user: this.adaptUserDto(payload.user),
    }
  }

  /**
   * Resolves country code to CountryDto object
   * Looks up country name from constants based on ISO code
   * @param code - ISO country code (e.g., 'US', 'GB')
   * @returns CountryDto with isoCode and countryName, or undefined if code is not provided
   */
  public resolveCountry(code?: string): CountryDto | undefined {
    if (!code) {
      return undefined
    }
    const match = COUNTRIES.find((c) => c.value === code)
    return {
      isoCode: code,
      countryName: match?.label || code,
    }
  }

  /**
   * Maps array of country codes to VisitedCountryDto array
   * Sets current date as default dateOfVisit for each country
   * @param codes - Array of ISO country codes
   * @returns Array of VisitedCountryDto objects
   */
  public mapVisitedCountryCodes(codes?: string[]): VisitedCountryDto[] {
    return (codes ?? []).map((code) => {
      const country = this.resolveCountry(code) ?? { isoCode: code, countryName: code }
      return {
        isoCode: country.isoCode,
        countryName: country.countryName,
        dateOfVisit: new Date().toISOString(),
      }
    })
  }

  /**
   * Maps array of hobby IDs to HobbyDto array
   * Looks up hobby names from travel interests constants
   * @param ids - Array of hobby IDs
   * @returns Array of HobbyDto objects with id and hobbyName
   */
  public mapHobbyIds(ids?: number[]): HobbyDto[] {
    return (ids ?? []).map((id) => {
      const match = TRAVEL_INTERESTS.find((h) => Number(h.value) === id)
      return {
        id,
        hobbyName: match?.label ?? `Interest ${id}`,
      }
    })
  }

  /**
   * Maps array of language codes to LanguageDto array
   * Looks up language names from languages constants
   * @param codes - Array of language codes (e.g., 'en', 'es')
   * @returns Array of LanguageDto objects with langCode and langName
   */
  public mapLanguageCodes(codes?: string[]): LanguageDto[] {
    return (codes ?? []).map((code) => {
      const match = LANGUAGES.find((lang) => lang.value === code)
      return {
        langCode: code,
        langName: match?.label ?? code,
      }
    })
  }

  /**
   * Retrieves authentication token from localStorage
   * @returns JWT token string or null if not found
   */
  public getAuthToken(): string | null {
    return localStorage.getItem(API_CONSTANTS.AUTH_TOKEN_KEY)
  }

  /**
   * Stores authentication token in localStorage
   * @param token - JWT token string to store
   */
  public setAuthToken(token: string): void {
    localStorage.setItem(API_CONSTANTS.AUTH_TOKEN_KEY, token)
  }

  /**
   * Removes authentication token from localStorage
   * Used during logout
   */
  public removeAuthToken(): void {
    localStorage.removeItem(API_CONSTANTS.AUTH_TOKEN_KEY)
  }

  /**
   * Retrieves CSRF token from cookies
   * CSRF token is stored in a readable cookie and sent in X-CSRF-TOKEN header
   * @returns CSRF token string or null if not found
   */
  public getCsrfToken(): string | null {
    if (typeof document === 'undefined') {
      return null
    }
    const cookieName = `${API_CONSTANTS.CSRF_COOKIE_NAME}=`
    return (
      document.cookie
        ?.split(';')
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith(cookieName))
        ?.substring(cookieName.length) ?? null
    )
  }

  /**
   * Builds HTTP headers for API requests
   * Includes Content-Type, CSRF token, and credentials
   * JWT is sent automatically via HttpOnly cookie
   * @returns Headers object with required headers
   */
  public getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // JWT is stored in HttpOnly cookie, so browser sends it automatically
    // We don't need to send it as Bearer token

    // CSRF token is in a readable cookie, we need to send it in header
    const csrfToken = this.getCsrfToken()
    if (csrfToken) {
      headers['X-CSRF-TOKEN'] = csrfToken
    }

    return headers
  }

  /**
   * Makes HTTP request to API endpoint
   * Handles JSON parsing, error handling, and response transformation
   * @param endpoint - API endpoint path (relative to baseURL)
   * @param options - Fetch API options (method, body, headers, etc.)
   * @returns Promise resolving to ApiResponse with typed data
   * @throws ApiError if request fails or response is not ok
   */
  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
      credentials: options.credentials ?? 'include',
    }

    try {
      const response = await fetch(url, config)
      
      // Check if response has content before trying to parse JSON
      const contentType = response.headers.get('content-type')
      let data: any = {}
      
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text()
        if (text) {
          try {
            data = JSON.parse(text)
          } catch (e) {
            console.error('Failed to parse JSON response:', text)
            data = { error: 'Invalid JSON response', message: text }
          }
        }
      }

      if (!response.ok) {
        // Extract error message from various possible response formats
        const errorMessage = data.error || data.message || data.detail || `Request failed with status ${response.status}`;
        throw new ApiError(errorMessage, response.status, data.code)
      }

      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(error instanceof Error ? error.message : 'Network error')
    }
  }
}


