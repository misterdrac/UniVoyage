import type { ApiClient } from './baseClient'

// Admin User types
export interface AdminUser {
  id: number
  name: string
  surname: string
  email: string
  role: 'USER' | 'ADMIN' | 'HEAD_ADMIN'
  dateOfRegister: string
  dateOfLastSignin: string
}

export interface AdminUserPage {
  content: AdminUser[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

// Admin Destination types
export interface AdminDestination {
  id: number
  name: string
  location: string
  continent: string
  imageUrl: string
  imageAlt: string
  overview: string
  budgetPerDay: number
  whyVisit: string
  studentPerks: string[]
  createdAt: string
  updatedAt: string
}

export interface AdminDestinationPage {
  content: AdminDestination[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface CreateDestinationRequest {
  name: string
  location: string
  continent: string
  imageUrl?: string
  imageAlt?: string
  overview?: string
  budgetPerDay?: number
  whyVisit?: string
  studentPerks?: string[]
}

export interface UpdateDestinationRequest extends CreateDestinationRequest {}

export interface AdminApi {
  // Users
  getUsers(params?: { page?: number; size?: number; sort?: string; search?: string }): Promise<AdminUserPage>
  getUser(id: number): Promise<AdminUser>
  updateUserRole(id: number, role: 'USER' | 'ADMIN' | 'HEAD_ADMIN'): Promise<AdminUser>
  
  // Destinations
  getAdminDestinations(params?: { page?: number; size?: number; sort?: string; search?: string }): Promise<AdminDestinationPage>
  getDestination(id: number): Promise<AdminDestination>
  createDestination(data: CreateDestinationRequest): Promise<AdminDestination>
  updateDestination(id: number, data: UpdateDestinationRequest): Promise<AdminDestination>
  deleteDestination(id: number): Promise<void>
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
}

