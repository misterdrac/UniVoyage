import { API_CONFIG, type AuthResponse } from '@/config/api'
import type { User } from '@/types/user'
import type { BackendUserDto } from './types'
import { API_CONSTANTS } from '@/lib/constants'
import type { ApiClient } from './baseClient'

export interface AuthApi {
  login(email: string, password: string): Promise<AuthResponse<User>>
  register(data: {
    email: string
    password: string
    name: string
    surname?: string
    countryCode: string
    hobbyIds?: number[]
    languageCodes?: string[]
    visitedCountryCodes?: string[]
  }): Promise<AuthResponse<User>>
  logout(): Promise<{ success: boolean }>
  getCurrentUser(): Promise<User | null>
  googleAuth(): Promise<void>
  googleCallback(code: string): Promise<AuthResponse<User>>
}

export const authApi: { [K in keyof AuthApi]: (this: ApiClient, ...args: Parameters<AuthApi[K]>) => ReturnType<AuthApi[K]> } =
  {
    async login(this: ApiClient, email, password) {
      if (this.useMock) {
        const { authenticateUser } = await import('@/data/mockUsers')
        const user = authenticateUser(email, password)
        if (user) {
          const token = `mock_token_${Date.now()}`
          this.setAuthToken(token)
          return { success: true, user, token }
        }
        return { success: false, error: 'Invalid email or password' }
      }

      const response = await this.request<AuthResponse<BackendUserDto>>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      const payload = this.adaptAuthPayload(response.data)

      if (payload.success) {
        if (payload.token) {
          this.setAuthToken(payload.token)
        }
        return payload
      }

      return {
        success: false,
        error: payload.error || response.error || 'Login failed',
      }
    },

    async register(this: ApiClient, data) {
      if (this.useMock) {
        try {
          const { createUser } = await import('@/data/mockUsers')
          const user = createUser(
            data.email,
            data.password,
            data.name,
            data.surname,
            data.hobbyIds,
            data.languageCodes
          )
          user.countryOfOrigin = this.resolveCountry(data.countryCode)
          user.visitedCountries = this.mapVisitedCountryCodes(data.visitedCountryCodes)

          const token = `mock_token_${Date.now()}`
          this.setAuthToken(token)
          return { success: true, user, token }
        } catch (err: any) {
          return { success: false, error: err?.message ?? 'Registration failed' }
        }
      }

      try {
        const res = await this.request<AuthResponse<BackendUserDto>>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            surname: data.surname,
            email: data.email,
            countryCode: data.countryCode,
            hobbyIds: data.hobbyIds ?? [],
            languageCodes: data.languageCodes ?? [],
            password: data.password,
            visitedCountryCodes: data.visitedCountryCodes ?? [],
          }),
        })

        const payload = this.adaptAuthPayload(res.data)
        if (payload.success) {
          if (payload.token) {
            this.setAuthToken(payload.token)
          }
          return payload
        }

        return { success: false, error: payload.error || res.error || 'Registration failed' }
      } catch (err: any) {
        return { success: false, error: err?.message ?? 'Registration failed' }
      }
    },

    async logout(this: ApiClient) {
      if (this.useMock) {
        this.removeAuthToken()
        return { success: true }
      }

      try {
        await this.request(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
          method: 'POST',
        })
      } catch (error) {
        console.warn('Logout request failed:', error)
      } finally {
        this.removeAuthToken()
      }

      return { success: true }
    },

    async getCurrentUser(this: ApiClient) {
      if (this.useMock) {
        const token = this.getAuthToken()
        if (!token) return null

        const savedUser = localStorage.getItem(API_CONSTANTS.USER_KEY)
        return savedUser ? JSON.parse(savedUser) : null
      }

      try {
        const response = await this.request<BackendUserDto>(API_CONFIG.ENDPOINTS.AUTH.ME)
        return this.adaptUserDto(response.data) || null
      } catch (error) {
        console.error('Failed to get current user:', error)
        return null
      }
    },

    async googleAuth(this: ApiClient) {
      if (this.useMock) {
        throw new Error('Google auth not available in mock mode')
      }

      window.location.href = `${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.GOOGLE}`
    },

    async googleCallback(this: ApiClient, code: string): Promise<AuthResponse<User>> {
      if (this.useMock) {
        throw new Error('Google auth not available in mock mode')
      }

      const res = await this.request<AuthResponse<BackendUserDto>>(
        API_CONFIG.ENDPOINTS.AUTH.GOOGLE_CALLBACK,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        }
      )

      const payload = this.adaptAuthPayload(res.data)

      if (payload.success && payload.token) {
        this.setAuthToken(payload.token)
      }

      return payload.success
        ? payload
        : { success: false, error: payload.error || res.error || 'Google login failed' }
    }



