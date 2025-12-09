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
  }): Promise<{ success: boolean; user?: User; error?: string }>
  uploadProfilePicture(file: File): Promise<{ success: boolean; user?: User; error?: string }>
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
      }

      if (this.useMock) {
        try {
          const savedUser = localStorage.getItem(API_CONSTANTS.USER_KEY)
          if (!savedUser) {
            return { success: false, error: 'User not found' }
          }

          const user = JSON.parse(savedUser) as User

          const updatedUser: User = {
            ...user,
            name: normalized.name ?? user.name,
            surname: normalized.surname ?? user.surname,
            countryOfOrigin: normalized.countryCode
            ? this.resolveCountry(normalized.countryCode)
              : user.countryOfOrigin,
          hobbies: normalized.hobbyIds ? this.mapHobbyIds(normalized.hobbyIds) : user.hobbies,
          languages: normalized.languageCodes ? this.mapLanguageCodes(normalized.languageCodes) : user.languages,
            visitedCountries: normalized.visitedCountryCodes
            ? this.mapVisitedCountryCodes(normalized.visitedCountryCodes)
              : user.visitedCountries,
          }

          localStorage.setItem(API_CONSTANTS.USER_KEY, JSON.stringify(updatedUser))

          return { success: true, user: updatedUser }
        } catch (err: any) {
          return { success: false, error: err?.message ?? 'Update failed' }
        }
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

    async uploadProfilePicture(this: ApiClient, file) {
      if (this.useMock) {
        try {
          const savedUser = localStorage.getItem(API_CONSTANTS.USER_KEY)
          if (!savedUser) {
            return { success: false, error: 'User not found' }
          }

          if (!file.type.startsWith('image/')) {
            return { success: false, error: 'File must be an image' }
          }

          if (file.size > 5 * 1024 * 1024) {
            return { success: false, error: 'Image must be less than 5MB' }
          }

          const reader = new FileReader()
          return new Promise((resolve, reject) => {
            reader.onloadend = async () => {
              try {
                const base64String = reader.result as string
                const user = JSON.parse(savedUser) as User
                const updatedUser = { ...user, profileImage: base64String }

                const { updateUserProfile } = await import('@/data/mockUsers')
                const result = updateUserProfile(user.id, { profileImage: base64String })
                const finalUser = result ?? updatedUser

                localStorage.setItem(API_CONSTANTS.USER_KEY, JSON.stringify(finalUser))
                resolve({ success: true, user: finalUser })
              } catch (err: any) {
                reject({ success: false, error: err?.message ?? 'Upload failed' })
              }
            }
            reader.onerror = () => reject({ success: false, error: 'Failed to read file' })

            reader.readAsDataURL(file)
          })
        } catch (err: any) {
          return { success: false, error: err?.message ?? 'Upload failed' }
        }
      }

      try {
        const formData = new FormData()
        formData.append('image', file)

        const res = await this.request<{ success: boolean; user: BackendUserDto }>(
          API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE_PICTURE,
          {
            method: 'POST',
            headers: {
              // Allow browser to set boundary
            },
            body: formData,
          }
        )

        if (res.success && res.data?.user) {
          const adaptedUser = this.adaptUserDto(res.data.user)
          if (adaptedUser) {
            localStorage.setItem(API_CONSTANTS.USER_KEY, JSON.stringify(adaptedUser))
            return { success: true, user: adaptedUser }
          }
        }

        return { success: false, error: res.error ?? 'Upload failed' }
      } catch (err: any) {
        return { success: false, error: err?.message ?? 'Upload failed' }
      }
    },
  }


