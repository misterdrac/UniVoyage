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

  private getAuthToken(): string | null {
    return localStorage.getItem(API_CONSTANTS.AUTH_TOKEN_KEY);
  }

  private setAuthToken(token: string): void {
    localStorage.setItem(API_CONSTANTS.AUTH_TOKEN_KEY, token);
  }

  private removeAuthToken(): void {
    localStorage.removeItem(API_CONSTANTS.AUTH_TOKEN_KEY);
  }

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

  // ---------------- AUTH ----------------

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

  /**
   * BE: POST /api/auth/register expects:
   * {
   *   email, password, name, surname?,
   *   countryCode,
   *   hobbyIds?: number[],
   *   languageCodes?: string[],
   *   visitedCountryCodes?: string[]
   * }
   */
  async register(data: {
    email: string;
    password: string;
    name: string;
    surname?: string;

    countryCode: string;
    hobbyIds?: number[];
    languageCodes?: string[];
    visitedCountryCodes?: string[];
  }): Promise<AuthResponse> {
    // ---- MOCK PATH ----
    if (this.useMock) {
      try {
        // mockUsers ti radi sa stringovima pa samo “fake” mapiramo
        const user = createUser(
          data.email,
          data.password,
          data.name,
          data.surname,
          (data.hobbyIds ?? []).map(String),
          (data.languageCodes ?? [])
        );
        user.country = data.countryCode;
        user.visited = data.visitedCountryCodes ?? [];

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
        }
      );

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
      return { success: false, error: err?.message ?? "Registration failed" };
    }
  }

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
      console.warn('Logout request failed:', error);
    } finally {
      this.removeAuthToken();
    }

    return { success: true };
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.useMock) {
      const token = this.getAuthToken();
      if (!token) return null;

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

  /**
   * BE: PUT /api/user/profile expects:
   * {
   *   name?, surname?,
   *   countryCode?,
   *   hobbyIds?,
   *   languageCodes?,
   *   visitedCountryCodes?
   * }
   */
  async updateProfile(data: {
    name?: string;
    surname?: string;

    countryCode?: string;
    hobbyIds?: number[];
    languageCodes?: string[];
    visitedCountryCodes?: string[];
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    if (this.useMock) {
      try {
        const savedUser = localStorage.getItem(API_CONSTANTS.USER_KEY);
        if (!savedUser) {
          return { success: false, error: 'User not found' };
        }

        const user = JSON.parse(savedUser) as User;

        const updatedUser: User = {
          ...user,
          ...data,
          hobbies: data.hobbyIds ? data.hobbyIds.map(String) : user.hobbies,
          languages: data.languageCodes ?? user.languages,
          country: data.countryCode ?? user.country,
          visited: data.visitedCountryCodes ?? user.visited,
        };

        const { updateUserProfile } = await import('@/data/mockUsers');
        const result = updateUserProfile(user.id, updatedUser);
        localStorage.setItem(API_CONSTANTS.USER_KEY, JSON.stringify(result ?? updatedUser));

        return { success: true, user: result ?? updatedUser };
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
          body: JSON.stringify({
            name: data.name ?? null,
            surname: data.surname ?? null,

            countryCode: data.countryCode ?? null,
            hobbyIds: data.hobbyIds ?? [],
            languageCodes: data.languageCodes ?? [],
            visitedCountryCodes: data.visitedCountryCodes ?? [],
          }),
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

  // ---------------- PROFILE PICTURE ----------------

  async uploadProfilePicture(file: File): Promise<{ success: boolean; user?: User; error?: string }> {
    if (this.useMock) {
      try {
        const savedUser = localStorage.getItem(API_CONSTANTS.USER_KEY);
        if (!savedUser) {
          return { success: false, error: 'User not found' };
        }

        if (!file.type.startsWith('image/')) {
          return { success: false, error: 'File must be an image' };
        }

        if (file.size > 5 * 1024 * 1024) {
          return { success: false, error: 'Image must be less than 5MB' };
        }

        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onloadend = async () => {
            try {
              const base64String = reader.result as string;
              const user = JSON.parse(savedUser) as User;
              const updatedUser = { ...user, profileImage: base64String };

              const { updateUserProfile } = await import('@/data/mockUsers');
              const result = updateUserProfile(user.id, { profileImage: base64String });
              const finalUser = result ?? updatedUser;

              localStorage.setItem(API_CONSTANTS.USER_KEY, JSON.stringify(finalUser));
              resolve({ success: true, user: finalUser });
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
      const formData = new FormData();
      formData.append('image', file);

      const res = await this.request<{ success: boolean; user: User }>(
        API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE_PICTURE,
        {
          method: 'POST',
          headers: {
            // let browser set boundary
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

  // ---------------- TRIPS (unchanged) ----------------

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

  private getMockTrips(): any[] {
    try {
      const tripsJson = localStorage.getItem('mock_trips');
      return tripsJson ? JSON.parse(tripsJson) : [];
    } catch {
      return [];
    }
  }
}

export const apiService = new ApiService();
