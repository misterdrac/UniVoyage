import type { ApiClient } from './baseClient'
import { API_CONFIG } from '@/config/apiConfig'

export interface QuizRequest {
  budget: string
  climate: string
  activityType: string
  continent: string
  travelStyle: string
}

export interface RecommendedDestination {
  destinationId: number
  name: string
  location: string
  continent: string
  imageUrl?: string
  budgetPerDay?: number
  matchReason: string
  highlights: string[]
}

export interface QuizRecommendationResponse {
  intro: string
  recommendations: RecommendedDestination[]
  closingNote: string
}

export interface QuizApi {
  getQuizRecommendation(
    request: QuizRequest
  ): Promise<{ success: boolean; data?: QuizRecommendationResponse; error?: string }>
}

export const quizApi: {
  [K in keyof QuizApi]: (this: ApiClient, ...args: Parameters<QuizApi[K]>) => ReturnType<QuizApi[K]>
} = {
  async getQuizRecommendation(
    this: ApiClient,
    request: QuizRequest
  ): Promise<{ success: boolean; data?: QuizRecommendationResponse; error?: string }> {
    try {
      const response = await this.request<QuizRecommendationResponse>(
        API_CONFIG.ENDPOINTS.QUIZ.RECOMMEND,
        {
          method: 'POST',
          body: JSON.stringify(request),
        }
      )

      if (response.success && response.data) {
        return { success: true, data: response.data }
      }

      return {
        success: false,
        error: response.error || 'Failed to get quiz recommendations.',
      }
    } catch (error: unknown) {
      console.error('Error getting quiz recommendations:', error)
      return {
        success: false,
        error: 'Something went wrong. Please try again.',
      }
    }
  },
}
