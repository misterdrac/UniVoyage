import { API_CONFIG, type ApiResponse, type AuthResponse, ApiError } from '@/config/api';
import type { User } from '@/data/mockUsers';
import { API_CONSTANTS } from '@/lib/constants';
import { authenticateUser, createUser } from '@/data/mockUsers';

class ApiService {
  private baseURL: string;
  private useMock: boolean;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.useMock = API_CONFIG.USE_MOCK;
  }

  // Get auth token from localStorage
  private getAuthToken(): string | null {
    return localStorage.getItem(API_CONSTANTS.AUTH_TOKEN_KEY);
  }

  // Set auth token in localStorage
  private setAuthToken(token: string): void {
    localStorage.setItem(API_CONSTANTS.AUTH_TOKEN_KEY, token);
  }

  // Remove auth token from localStorage
  private removeAuthToken(): void {
    localStorage.removeItem(API_CONSTANTS.AUTH_TOKEN_KEY);
  }

  // Get headers for API requests
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  // Generic API request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    if (this.useMock) {
      throw new Error('Mock mode - use mock service instead');
    }

    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error || data.message || 'Request failed',
          response.status,
          data.code
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error'
      );
    }
  }

  // Auth API methods
  // BE: POST /api/auth/login returns {success, user, token} or {success, error}
  // User: {id, firstName, surname?, email, hobbies, languages, country, visited, profileImage?, dateOfRegister, dateOfLastSignin?, role}
  async login(email: string, password: string): Promise<AuthResponse> {
    if (this.useMock) {
      const user = authenticateUser(email, password);
      if (user) {
        const token = `mock_token_${Date.now()}`;
        this.setAuthToken(token);
        return { success: true, user, token };
      }
      return { success: false, error: 'Invalid email or password' };
    }

    const response = await this.request<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );

    if (response.success && response.data?.token) {
      this.setAuthToken(response.data.token);
    }

    return response.data || response;
  }

  // BE: POST /api/auth/register expects {email, password, firstName, surname?, hobbies?, languages?, country?}
  // Returns {success, user, token} or {success, error}. User: {id, firstName, surname?, email, hobbies, languages, country, visited, profileImage?, dateOfRegister, dateOfLastSignin?, role}
  async register(data: {
    email: string;
    password: string;
    firstName?: string;
    surname?: string;
    hobbies?: string[];
    languages?: string[];
    country?: string;
  }): Promise<AuthResponse> {
    // ---- MOCK PATH ----
    if (this.useMock) {
      try {
        const user = createUser(data.email, data.password, data.firstName, data.surname, data.hobbies, data.languages);
        if (data.country) user.country = data.country;
        const token = `mock_token_${Date.now()}`;
        this.setAuthToken(token);
        return { success: true, user, token };
      } catch (err: any) {
        return { success: false, error: err?.message ?? "Registration failed" };
      }
    }

    // ---- REAL API PATH ----
    try {
      const res = await this.request<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // send only the fields backend understands (avoid undefineds)
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            firstName: data.firstName ?? null,
            surname: data.surname ?? null,
            hobbies: data.hobbies ?? [],
            languages: data.languages ?? [],
            country: data.country ?? null, // if your backend @NotBlank, make sure UI passes it
          }),
        }
      );

      // Your request() returns ApiResponse<T>. The backend returns {success,user,token}.
      // So res.success is transport-level, res.data is the backend payload.
      if (!res.success) {
        return { success: false, error: res.error ?? "Registration failed" };
      }

      const payload = res.data as AuthResponse | undefined;
      if (!payload || !payload.success) {
        return { success: false, error: payload?.error ?? "Registration failed" };
      }

      if (payload.token) this.setAuthToken(payload.token);
      return payload;
    } catch (err: any) {
      // Normalize common backend errors: 400/409, etc.
      return { success: false, error: err?.message ?? "Registration failed" };
    }
  }


  // BE: POST /api/auth/logout with Authorization: Bearer <token> returns {success: true}
  async logout(): Promise<{ success: boolean }> {
    if (this.useMock) {
      this.removeAuthToken();
      return { success: true };
    }

    try {
      await this.request(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
      });
    } catch (error) {
      // Even if logout fails on server, clear local token
      console.warn('Logout request failed:', error);
    } finally {
      this.removeAuthToken();
    }

    return { success: true };
  }

  // BE: GET /api/auth/me with Authorization: Bearer <token> returns {success, data: {user}} or {success: false, error}
  async getCurrentUser(): Promise<User | null> {
    if (this.useMock) {
      const token = this.getAuthToken();
      if (!token) return null;
      
      // In mock mode, get user from localStorage
      const savedUser = localStorage.getItem(API_CONSTANTS.USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    }

    try {
      const response = await this.request<{ user: User }>(
        API_CONFIG.ENDPOINTS.AUTH.ME
      );
      return response.data?.user || null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  async googleAuth(): Promise<void> {
    if (this.useMock) {
      throw new Error('Google auth not available in mock mode');
    }

    // Redirect to Google OAuth
    window.location.href = `${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.GOOGLE}`;
  }

  async googleCallback(code: string): Promise<AuthResponse> {
    if (this.useMock) {
      throw new Error('Google auth not available in mock mode');
    }

    const response = await this.request<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.GOOGLE_CALLBACK,
      {
        method: 'POST',
        body: JSON.stringify({ code }),
      }
    );

    if (response.success && response.data?.token) {
      this.setAuthToken(response.data.token);
    }

    return response.data || response;
  }

  // BE: PUT /api/user/profile with Authorization: Bearer <token> expects {firstName?, surname?, country?, hobbies?, languages?, visited?}
  // Returns {success, data: {success, user}} or {success: false, error}
  async updateProfile(data: {
    firstName?: string;
    surname?: string;
    country?: string;
    hobbies?: string[];
    languages?: string[];
    visited?: string[];
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    if (this.useMock) {
      try {
        const savedUser = localStorage.getItem(API_CONSTANTS.USER_KEY);
        if (!savedUser) {
          return { success: false, error: 'User not found' };
        }
        
        const user = JSON.parse(savedUser) as User;
        const updatedUser = { ...user, ...data };
        
        // Update mockUsers if it exists
        const { updateUserProfile } = await import('@/data/mockUsers');
        const result = updateUserProfile(user.id, data);
        if (result) {
          localStorage.setItem(API_CONSTANTS.USER_KEY, JSON.stringify(result));
          return { success: true, user: result };
        }
        
        // Fallback: just update localStorage
        localStorage.setItem(API_CONSTANTS.USER_KEY, JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      } catch (err: any) {
        return { success: false, error: err?.message ?? "Update failed" };
      }
    }

    try {
      const res = await this.request<{ success: boolean; user: User }>(
        API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );

      if (res.success && res.data?.user) {
        localStorage.setItem(API_CONSTANTS.USER_KEY, JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }

      return { success: false, error: res.error ?? "Update failed" };
    } catch (err: any) {
      return { success: false, error: err?.message ?? "Update failed" };
    }
  }

  // BE: POST /api/user/profile-picture with Authorization: Bearer <token>, FormData with 'image' field, max 5MB
  // Returns {success, data: {success, user}} or {success: false, error}
  async uploadProfilePicture(file: File): Promise<{ success: boolean; user?: User; error?: string }> {
    if (this.useMock) {
      try {
        const savedUser = localStorage.getItem(API_CONSTANTS.USER_KEY);
        if (!savedUser) {
          return { success: false, error: 'User not found' };
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          return { success: false, error: 'File must be an image' };
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          return { success: false, error: 'Image must be less than 5MB' };
        }
        
        // Convert file to base64 data URL for mock mode
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onloadend = async () => {
            try {
              const base64String = reader.result as string;
              const user = JSON.parse(savedUser) as User;
              const updatedUser = { ...user, profileImage: base64String };
              
              // Update mockUsers if it exists
              const { updateUserProfile } = await import('@/data/mockUsers');
              const result = updateUserProfile(user.id, { profileImage: base64String });
              if (result) {
                localStorage.setItem(API_CONSTANTS.USER_KEY, JSON.stringify(result));
                resolve({ success: true, user: result });
              } else {
                localStorage.setItem(API_CONSTANTS.USER_KEY, JSON.stringify(updatedUser));
                resolve({ success: true, user: updatedUser });
              }
            } catch (err: any) {
              reject({ success: false, error: err?.message ?? "Upload failed" });
            }
          };
          reader.onerror = () => reject({ success: false, error: 'Failed to read file' });
          
          reader.readAsDataURL(file);
        });
      } catch (err: any) {
        return { success: false, error: err?.message ?? "Upload failed" };
      }
    }

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', file);

      const res = await this.request<{ success: boolean; user: User }>(
        API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE_PICTURE,
        {
          method: 'POST',
          headers: {
            // Don't set Content-Type, let browser set it with boundary for FormData
          },
          body: formData,
        }
      );

      if (res.success && res.data?.user) {
        localStorage.setItem(API_CONSTANTS.USER_KEY, JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }

      return { success: false, error: res.error ?? "Upload failed" };
    } catch (err: any) {
      return { success: false, error: err?.message ?? "Upload failed" };
    }
  }

  // Trip API methods
  // BE: POST /api/trips with Authorization: Bearer <token> expects {destinationId, destinationName, destinationLocation, departureDate, returnDate}
  // Returns {success, data: {trip}} or {success: false, error}
  async createTrip(data: {
    destinationId: number;
    destinationName: string;
    destinationLocation: string;
    departureDate: string;
    returnDate: string;
  }): Promise<{ success: boolean; trip?: any; error?: string }> {
    if (this.useMock) {
      try {
        const savedUser = localStorage.getItem(API_CONSTANTS.USER_KEY);
        if (!savedUser) {
          return { success: false, error: 'User not found' };
        }
        
        const user = JSON.parse(savedUser) as User;
        const trips = this.getMockTrips();
        
        const newTrip = {
          id: trips.length > 0 ? Math.max(...trips.map(t => t.id)) + 1 : 1,
          userId: user.id,
          destinationId: data.destinationId,
          destinationName: data.destinationName,
          destinationLocation: data.destinationLocation,
          departureDate: data.departureDate,
          returnDate: data.returnDate,
          createdAt: new Date().toISOString(),
          status: 'planned' as const,
        };
        
        trips.push(newTrip);
        localStorage.setItem('mock_trips', JSON.stringify(trips));
        
        return { success: true, trip: newTrip };
      } catch (err: any) {
        return { success: false, error: err?.message ?? "Trip creation failed" };
      }
    }

    try {
      const res = await this.request<{ success: boolean; trip: any }>(
        API_CONFIG.ENDPOINTS.TRIPS.CREATE,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );

      if (res.success && res.data?.trip) {
        return { success: true, trip: res.data.trip };
      }

      return { success: false, error: res.error ?? "Trip creation failed" };
    } catch (err: any) {
      return { success: false, error: err?.message ?? "Trip creation failed" };
    }
  }

  // BE: GET /api/trips with Authorization: Bearer <token>
  // Returns {success, data: {trips: Trip[]}} or {success: false, error}
  async getTrips(): Promise<{ success: boolean; trips?: any[]; error?: string }> {
    if (this.useMock) {
      try {
        const savedUser = localStorage.getItem(API_CONSTANTS.USER_KEY);
        if (!savedUser) {
          return { success: false, error: 'User not found' };
        }
        
        const user = JSON.parse(savedUser) as User;
        const trips = this.getMockTrips();
        const userTrips = trips.filter(trip => trip.userId === user.id);
        
        return { success: true, trips: userTrips };
      } catch (err: any) {
        return { success: false, error: err?.message ?? "Failed to fetch trips" };
      }
    }

    try {
      const res = await this.request<{ success: boolean; trips: any[] }>(
        API_CONFIG.ENDPOINTS.TRIPS.GET_ALL
      );

      if (res.success && res.data?.trips) {
        return { success: true, trips: res.data.trips };
      }

      return { success: false, error: res.error ?? "Failed to fetch trips" };
    } catch (err: any) {
      return { success: false, error: err?.message ?? "Failed to fetch trips" };
    }
  }

  // BE: DELETE /api/trips/:id with Authorization: Bearer <token>
  // Returns {success} or {success: false, error}
  async deleteTrip(tripId: number): Promise<{ success: boolean; error?: string }> {
    if (this.useMock) {
      try {
        const savedUser = localStorage.getItem(API_CONSTANTS.USER_KEY);
        if (!savedUser) {
          return { success: false, error: 'User not found' };
        }
        
        const user = JSON.parse(savedUser) as User;
        const trips = this.getMockTrips();
        const tripIndex = trips.findIndex(t => t.id === tripId && t.userId === user.id);
        
        if (tripIndex === -1) {
          return { success: false, error: 'Trip not found' };
        }
        
        trips.splice(tripIndex, 1);
        localStorage.setItem('mock_trips', JSON.stringify(trips));
        
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message ?? "Trip deletion failed" };
      }
    }

    try {
      const res = await this.request<{ success: boolean }>(
        `${API_CONFIG.ENDPOINTS.TRIPS.DELETE}/${tripId}`,
        {
          method: 'DELETE',
        }
      );

      if (res.success) {
        return { success: true };
      }

      return { success: false, error: res.error ?? "Trip deletion failed" };
    } catch (err: any) {
      return { success: false, error: err?.message ?? "Trip deletion failed" };
    }
  }

  // Helper method to get mock trips from localStorage
  private getMockTrips(): any[] {
    try {
      const tripsJson = localStorage.getItem('mock_trips');
      return tripsJson ? JSON.parse(tripsJson) : [];
    } catch {
      return [];
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
