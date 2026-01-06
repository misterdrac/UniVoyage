import type { User } from '@/types/user'
import { API_CONSTANTS } from '@/lib/constants'
import { API_CONFIG } from '@/config/api'
import type { BackendUserDto } from './types'
import type { ApiClient } from './baseClient'

export interface ProfileApi {
  updateProfile(data: {
    name?: string
    surname?: string
    countryCode?: string
    hobbyIds?: number[]
    languageCodes?: string[]
    visitedCountryCodes?: string[]
    profileImagePath?: string
  }): Promise<{ success: boolean; user?: User; error?: string }>
}

export const profileApi: { [K in keyof ProfileApi]: (this: ApiClient, ...args: Parameters<ProfileApi[K]>) => ReturnType<ProfileApi[K]> } =
  {
    async updateProfile(this: ApiClient, data) {
      const normalized = {
        name: data.name,
        surname: data.surname,
        countryCode: data.countryCode,
        hobbyIds: data.hobbyIds,
        languageCodes: data.languageCodes,
        visitedCountryCodes: data.visitedCountryCodes,
        profileImagePath: data.profileImagePath,
      }

      try {
        const res = await this.request<{ success: boolean; user: User }>(API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: normalized.name ?? null,
            surname: normalized.surname ?? null,
            countryCode: normalized.countryCode ?? null,
            hobbyIds: normalized.hobbyIds ?? null, // -> ?? [] changed to ?? null, same for languageCodes and visitedCountryCodes
            languageCodes: normalized.languageCodes ?? null,
            visitedCountryCodes: normalized.visitedCountryCodes ?? null,
            profileImagePath: normalized.profileImagePath ?? null,
          }),
        })

        if (res.success && res.data?.user) {
          const adaptedUser = this.adaptUserDto(res.data.user)
          if (adaptedUser) {
            localStorage.setItem(API_CONSTANTS.USER_KEY, JSON.stringify(adaptedUser))
            return { success: true, user: adaptedUser }
          }
        }

        return { success: false, error: res.error ?? 'Update failed' }
      } catch (err: any) {
        return { success: false, error: err?.message ?? 'Update failed' }
      }
    },
  }


