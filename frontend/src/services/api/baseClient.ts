import { API_CONFIG, type ApiResponse, type AuthResponse, ApiError } from '@/config/api'
import { API_CONSTANTS, COUNTRIES, LANGUAGES, TRAVEL_INTERESTS } from '@/lib/constants'
import type { User, CountryDto, HobbyDto, LanguageDto, VisitedCountryDto } from '@/types/user'
import type { BackendUserDto } from './types'

export class ApiClient {
  public baseURL: string
  public useMock: boolean

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    this.useMock = API_CONFIG.USE_MOCK
  }

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

  public mapHobbyIds(ids?: number[]): HobbyDto[] {
    return (ids ?? []).map((id) => {
      const match = TRAVEL_INTERESTS.find((h) => Number(h.value) === id)
      return {
        id,
        hobbyName: match?.label ?? `Interest ${id}`,
      }
    })
  }

  public mapLanguageCodes(codes?: string[]): LanguageDto[] {
    return (codes ?? []).map((code) => {
      const match = LANGUAGES.find((lang) => lang.value === code)
      return {
        langCode: code,
        langName: match?.label ?? code,
      }
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

  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    if (this.useMock) {
      throw new Error('Mock mode - use mock service instead')
    }

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
        throw new ApiError(data.error || data.message || 'Request failed', response.status, data.code)
      }

      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(error instanceof Error ? error.message : 'Network error')
    }
  }

  public getMockTrips(): any[] {
    try {
      const tripsJson = localStorage.getItem('mock_trips')
      return tripsJson ? JSON.parse(tripsJson) : []
    } catch {
      return []
    }
  }
}


