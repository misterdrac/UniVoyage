import type { ApiClient } from './baseClient'

/**
 * Pending review for moderation
 */
export interface AdminPendingReview {
  ratingId: number
  tripId: number
  destinationId: number
  destinationName: string
  userEmail: string
  stars: number
  comment: string
  createdAt: string
  updatedAt: string
}

export interface AdminPendingReviewPage {
  content: AdminPendingReview[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

/**
 * Admin User data structure
 */
export interface AdminUser {
  id: number
  name: string
  surname: string
  email: string
  role: 'USER' | 'ADMIN' | 'HEAD_ADMIN'
  dateOfRegister: string
  dateOfLastSignin: string
}

/**
 * Paginated admin users response
 */
export interface AdminUserPage {
  content: AdminUser[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

/**
 * Admin Destination data structure
 */
export interface AdminDestination {
  id: number
  name: string
  location: string
  continent: string
  /** ISO 3166-1 alpha-2; required for create/update */
  countryCode?: string
  imageUrl: string
  imageAlt: string
  overview: string
  budgetPerDay: number
  whyVisit: string
  studentPerks: string[]
  /** 0–5; optional until set in admin */
  averageRating?: number | null
  createdAt: string
  updatedAt: string
}

/**
 * Paginated admin destinations response
 */
export interface AdminDestinationPage {
  content: AdminDestination[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

/**
 * Request payload for creating a new destination
 */
export interface CreateDestinationRequest {
  name: string
  location: string
  continent: string
  countryCode: string
  imageUrl?: string
  imageAlt?: string
  overview?: string
  budgetPerDay?: number
  whyVisit?: string
  studentPerks?: string[]
  /** 0–5, optional */
  averageRating?: number | null
}

/**
 * Request payload for updating an existing destination
 */
export interface UpdateDestinationRequest extends CreateDestinationRequest {}

/**
 * Admin API interface
 * Handles administrative operations for users and destinations
 * Requires ADMIN or HEAD_ADMIN role
 */
export interface AdminApi {
  /**
   * Retrieves paginated list of users
   * @param params - Pagination and filtering parameters
   * @returns Promise resolving to paginated users response
   */
  getUsers(params?: { page?: number; size?: number; sort?: string; search?: string }): Promise<AdminUserPage>
  
  /**
   * Retrieves a single user by ID
   * @param id - User ID
   * @returns Promise resolving to user data
   */
  getUser(id: number): Promise<AdminUser>
  
  /**
   * Updates a user's role
   * @param id - User ID
   * @param role - New role to assign
   * @returns Promise resolving to updated user data
   */
  updateUserRole(id: number, role: 'USER' | 'ADMIN' | 'HEAD_ADMIN'): Promise<AdminUser>
  
  /**
   * Retrieves paginated list of destinations
   * @param params - Pagination and filtering parameters
   * @returns Promise resolving to paginated destinations response
   */
  getAdminDestinations(params?: { page?: number; size?: number; sort?: string; search?: string }): Promise<AdminDestinationPage>
  
  /**
   * Retrieves a single destination by ID
   * @param id - Destination ID
   * @returns Promise resolving to destination data
   */
  getDestination(id: number): Promise<AdminDestination>
  
  /**
   * Creates a new destination
   * @param data - Destination creation data
   * @returns Promise resolving to created destination data
   */
  createDestination(data: CreateDestinationRequest): Promise<AdminDestination>
  
  /**
   * Updates an existing destination
   * @param id - Destination ID
   * @param data - Destination update data
   * @returns Promise resolving to updated destination data
   */
  updateDestination(id: number, data: UpdateDestinationRequest): Promise<AdminDestination>
  
  /**
   * Deletes a destination
   * @param id - Destination ID
   * @returns Promise that resolves when deletion is complete
   */
  deleteDestination(id: number): Promise<void>

  getPendingReviews(params?: { page?: number; size?: number }): Promise<AdminPendingReviewPage>
  approveReview(ratingId: number): Promise<void>
  rejectReview(ratingId: number): Promise<void>
}

export const adminApi: { [K in keyof AdminApi]: (this: ApiClient, ...args: Parameters<AdminApi[K]>) => ReturnType<AdminApi[K]> } = {
  async getUsers(this: ApiClient, params = {}) {
    const searchParams = new URLSearchParams()
    if (params.page !== undefined) searchParams.append('page', params.page.toString())
    if (params.size !== undefined) searchParams.append('size', params.size.toString())
    if (params.sort) searchParams.append('sort', params.sort)
    if (params.search) searchParams.append('search', params.search)
    
    const query = searchParams.toString()
    const endpoint = `/admin/users${query ? `?${query}` : ''}`
    
    const response = await this.request<AdminUserPage>(endpoint)
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch users')
    }
    return response.data
  },

  async getUser(this: ApiClient, id: number) {
    const response = await this.request<AdminUser>(`/admin/users/${id}`)
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch user')
    }
    return response.data
  },

  async updateUserRole(this: ApiClient, id: number, role: 'USER' | 'ADMIN' | 'HEAD_ADMIN') {
    const response = await this.request<AdminUser>(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    })
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update user role')
    }
    return response.data
  },

  async getAdminDestinations(this: ApiClient, params = {}) {
    const searchParams = new URLSearchParams()
    if (params.page !== undefined) searchParams.append('page', params.page.toString())
    if (params.size !== undefined) searchParams.append('size', params.size.toString())
    if (params.sort) searchParams.append('sort', params.sort)
    if (params.search) searchParams.append('search', params.search)
    
    const query = searchParams.toString()
    const endpoint = `/admin/destinations${query ? `?${query}` : ''}`
    
    const response = await this.request<AdminDestinationPage>(endpoint)
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch destinations')
    }
    return response.data
  },

  async getDestination(this: ApiClient, id: number) {
    const response = await this.request<AdminDestination>(`/admin/destinations/${id}`)
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch destination')
    }
    return response.data
  },

  async createDestination(this: ApiClient, data: CreateDestinationRequest) {
    const response = await this.request<AdminDestination>('/admin/destinations', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create destination')
    }
    return response.data
  },

  async updateDestination(this: ApiClient, id: number, data: UpdateDestinationRequest) {
    const response = await this.request<AdminDestination>(`/admin/destinations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update destination')
    }
    return response.data
  },

  async deleteDestination(this: ApiClient, id: number) {
    await this.request<void>(`/admin/destinations/${id}`, {
      method: 'DELETE',
    })
  },

  async getPendingReviews(this: ApiClient, params = {}) {
    const searchParams = new URLSearchParams()
    if (params.page !== undefined) searchParams.append('page', params.page.toString())
    if (params.size !== undefined) searchParams.append('size', params.size.toString())
    const query = searchParams.toString()
    const endpoint = `/admin/reviews/pending${query ? `?${query}` : ''}`
    const response = await this.request<AdminPendingReviewPage>(endpoint)
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch pending reviews')
    }
    return response.data
  },

  async approveReview(this: ApiClient, ratingId: number) {
    await this.request<void>(`/admin/reviews/${ratingId}/approve`, { method: 'POST' })
  },

  async rejectReview(this: ApiClient, ratingId: number) {
    await this.request<void>(`/admin/reviews/${ratingId}/reject`, { method: 'POST' })
  },
}

