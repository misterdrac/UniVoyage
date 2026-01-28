import { API_CONFIG, type ApiResponse, type AuthResponse, ApiError } from '@/config/apiConfig'
import { API_CONSTANTS, COUNTRIES, LANGUAGES, TRAVEL_INTERESTS } from '@/lib/constants'
import type { User, CountryDto, HobbyDto, LanguageDto, VisitedCountryDto } from '@/types/user'
import type { BackendUserDto } from './types'

/**
 * Base HTTP client for API communication
 */
export class ApiClient {
  public baseURL: string

  constructor() {
    // Ovo će sada biti '/api' zahvaljujući promjeni u apiConfig.ts
    this.baseURL = API_CONFIG.BASE_URL
  }

  public adaptUserDto(user?: BackendUserDto): User | undefined {
    if (!user) return undefined

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

  public adaptAuthPayload(payload?: AuthResponse<BackendUserDto>): AuthResponse<User> {
    if (!payload) return { success: false, error: 'Missing auth payload' }
    return {
      success: payload.success,
      token: payload.token,
      csrfToken: payload.csrfToken,
      error: payload.error,
      user: this.adaptUserDto(payload.user),
    }
  }

  public resolveCountry(code?: string): CountryDto | undefined {
    if (!code) return undefined
    const match = COUNTRIES.find((c) => c.value === code)
    return { isoCode: code, countryName: match?.label || code }
  }

  public mapVisitedCountryCodes(codes?: string[]): VisitedCountryDto[] {
    return (codes ?? []).map((code) => {
      const country = this.resolveCountry(code) ?? { isoCode: code, countryName: code }
      return { isoCode: country.isoCode, countryName: country.countryName, dateOfVisit: new Date().toISOString() }
    })
  }

  public mapHobbyIds(ids?: number[]): HobbyDto[] {
    return (ids ?? []).map((id) => {
      const match = TRAVEL_INTERESTS.find((h) => Number(h.value) === id)
      return { id, hobbyName: match?.label ?? `Interest ${id}` }
    })
  }

  public mapLanguageCodes(codes?: string[]): LanguageDto[] {
    return (codes ?? []).map((code) => {
      const match = LANGUAGES.find((lang) => lang.value === code)
      return { langCode: code, langName: match?.label ?? code }
    })
  }

  public getAuthToken(): string | null {
    return localStorage.getItem(API_CONSTANTS.AUTH_TOKEN_KEY)
  }

  public setAuthToken(token: string): void {
    localStorage.setItem(API_CONSTANTS.AUTH_TOKEN_KEY, token)
  }

  public removeAuthToken(): void {
    localStorage.removeItem(API_CONSTANTS.AUTH_TOKEN_KEY)
  }

  /**
   * Poboljšano čitanje CSRF tokena iz kolačića koristeći Regex
   */
  public getCsrfToken(): string | null {
    if (typeof document === 'undefined') return null
    const name = API_CONSTANTS.CSRF_COOKIE_NAME;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() ?? null;
    return null;
  }

  /**
   * Kreira zaglavlja s podrškom za JWT i CSRF
   */
  public getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    // Dodajemo JWT iz localStoragea (za svaki slučaj uz keks)
    const token = this.getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // Dodajemo CSRF token koji je neophodan za POST/PUT/DELETE
    const csrfToken = this.getCsrfToken()
    if (csrfToken) {
      headers['X-CSRF-TOKEN'] = csrfToken
    }

    return headers
  }

  /**
   * Centralna metoda za slanje zahtjeva
   */
  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // Osiguravamo da endpoint ne počinje s duplom kosom crtom akobaseURL već završava njome
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseURL}${cleanEndpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers, // Omogućuje prepisivanje zaglavlja po potrebi
      },
      // 'include' šalje kolačiće čak i na cross-origin zahtjeve (bitno za kandidate bez proxyja)
      credentials: options.credentials ?? 'include',
    }

    try {
      const response = await fetch(url, config)

      const contentType = response.headers.get('content-type')
      let data: any = {}

      if (contentType && contentType.includes('application/json')) {
        const text = await response.text()
        if (text) {
          try {
            data = JSON.parse(text)
          } catch (e) {
            data = { error: 'Invalid JSON response', message: text }
          }
        }
      }

      if (!response.ok) {
        const errorMessage = data.error || data.message || `Request failed: ${response.status}`;
        throw new ApiError(errorMessage, response.status, data.code)
      }

      return data
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(error instanceof Error ? error.message : 'Network error')
    }
  }
}