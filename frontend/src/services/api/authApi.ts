import { API_CONFIG, type AuthResponse } from '@/config/apiConfig'
import type { User } from '@/types/user'
import type { BackendUserDto } from './types'
import { API_CONSTANTS } from '@/lib/constants'
import type { ApiClient } from './baseClient'

export interface AuthApi {
  login(email: string, password: string): Promise<AuthResponse<User>>
  register(data: {
    email: string
    password: string
    name?: string
    surname?: string
    countryCode?: string
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
      try {
        const res = await this.request<AuthResponse<BackendUserDto>>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name || '',
            surname: data.surname,
            email: data.email,
            countryCode: data.countryCode || null,
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
      try {
        const response = await this.request<BackendUserDto>(API_CONFIG.ENDPOINTS.AUTH.ME)
        return this.adaptUserDto(response.data) || null
      } catch (error) {
        console.error('Failed to get current user:', error)
        return null
      }
    },

    async googleAuth(this: ApiClient): Promise<void> {
      // Store current page URL for redirect after OAuth
      const currentUrl = window.location.pathname + window.location.search
      sessionStorage.setItem('google_oauth_redirect', currentUrl)

      // Open OAuth in a popup window
      const width = 500
      const height = 600
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2

      const popup = window.open(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.GOOGLE}`,
        'google-oauth',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
      )

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.')
      }

      // Listen for messages from the popup
      return new Promise((resolve, reject) => {
        const messageListener = (event: MessageEvent) => {
          // Verify origin for security
          if (event.origin !== window.location.origin) {
            return
          }

          if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
            window.removeEventListener('message', messageListener)
            popup.close()
            resolve()
          } else if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
            window.removeEventListener('message', messageListener)
            popup.close()
            reject(new Error(event.data.error || 'Google OAuth failed'))
          }
        }

        window.addEventListener('message', messageListener)

        // Check if popup is closed manually
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed)
            window.removeEventListener('message', messageListener)
            reject(new Error('OAuth popup was closed'))
          }
        }, 500)
      })
    },

    async googleCallback(this: ApiClient, code: string): Promise<AuthResponse<User>> {
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
  }


