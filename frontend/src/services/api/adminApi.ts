import type { ApiClient } from "./baseClient";

/**
 * Pending review for moderation
 */
export interface AdminPendingReview {
  ratingId: number;
  tripId: number;
  destinationId: number;
  destinationName: string;
  userEmail: string;
  stars: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPendingReviewPage {
  content: AdminPendingReview[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/**
 * Admin User data structure
 */
export interface AdminUser {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: "USER" | "ADMIN" | "HEAD_ADMIN";
  dateOfRegister: string;
  dateOfLastSignin: string;
}

/**
 * Paginated admin users response
 */
export interface AdminUserPage {
  content: AdminUser[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/**
 * Admin Destination data structure
 */
export interface AdminDestination {
  id: number;
  name: string;
  location: string;
  continent: string;
  /** ISO 3166-1 alpha-2; required for create/update */
  countryCode?: string;
  imageUrl: string;
  imageAlt: string;
  overview: string;
  budgetPerDay: number;
  whyVisit: string;
  studentPerks: string[];
  /** 0–5; optional until set in admin */
  averageRating?: number | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Paginated admin destinations response
 */
export interface AdminDestinationPage {
  content: AdminDestination[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/**
 * Request payload for creating a new destination
 */
export interface CreateDestinationRequest {
  name: string;
  location: string;
  continent: string;
  countryCode: string;
  imageUrl?: string;
  imageAlt?: string;
  overview?: string;
  budgetPerDay?: number;
  whyVisit?: string;
  studentPerks?: string[];
  /** 0–5, optional */
  averageRating?: number | null;
}

/**
 * Request payload for updating an existing destination
 */
export interface UpdateDestinationRequest extends CreateDestinationRequest {}

export interface AdminHobby {
  id: number;
  hobbyName: string;
  displayLabel: string;
  emoji: string | null;
  sortOrder: number;
  active: boolean;
}

export interface AdminHobbyPage {
  content: AdminHobby[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface CreateAdminHobbyRequest {
  hobbyName: string;
  displayLabel: string;
  emoji: string;
}

export interface PatchAdminHobbyRequest {
  hobbyName?: string;
  displayLabel?: string;
  emoji?: string | null;
  sortOrder?: number;
  active?: boolean;
}

export interface AdminLanguage {
  langCode: string;
  langName: string;
  emoji: string | null;
  sortOrder: number;
  active: boolean;
}

export interface AdminLanguagePage {
  content: AdminLanguage[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface CreateAdminLanguageRequest {
  langCode: string;
  langName: string;
}

export interface PatchAdminLanguageRequest {
  langName?: string;
  emoji?: string | null;
  sortOrder?: number;
  active?: boolean;
}

export interface AdminCountry {
  isoCode: string;
  countryName: string;
  currencyCode: string | null;
  currencyName: string | null;
  sortOrder: number;
  active: boolean;
}

export interface AdminCountryPage {
  content: AdminCountry[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface CreateAdminCountryRequest {
  isoCode: string;
  countryName: string;
  currencyCode: string;
  currencyName?: string | null;
}

export interface PatchAdminCountryRequest {
  countryName?: string;
  currencyCode?: string | null;
  currencyName?: string | null;
  sortOrder?: number;
  active?: boolean;
}

export type CmsAuditEventType =
  | "ADMIN_LOGIN_SUCCESS"
  | "ADMIN_LOGIN_FAILED"
  | "ADMIN_LOGOUT"
  | "USER_ROLE_CHANGED";

export interface CmsAuditLog {
  id: number;
  createdAt: string;
  eventType: CmsAuditEventType;
  actorUserId: number | null;
  actorEmail: string | null;
  targetUserId: number | null;
  targetEmail: string | null;
  ipAddress: string | null;
  metadata: string | null;
}

export interface CmsAuditLogPage {
  content: CmsAuditLog[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

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
  getUsers(params?: {
    page?: number;
    size?: number;
    sort?: string;
    search?: string;
  }): Promise<AdminUserPage>;

  /**
   * Retrieves a single user by ID
   * @param id - User ID
   * @returns Promise resolving to user data
   */
  getUser(id: number): Promise<AdminUser>;

  /**
   * Updates a user's role
   * @param id - User ID
   * @param role - New role to assign
   * @returns Promise resolving to updated user data
   */
  updateUserRole(
    id: number,
    role: "USER" | "ADMIN" | "HEAD_ADMIN",
  ): Promise<AdminUser>;

  /**
   * Retrieves paginated list of destinations
   * @param params - Pagination and filtering parameters
   * @returns Promise resolving to paginated destinations response
   */
  getAdminDestinations(params?: {
    page?: number;
    size?: number;
    sort?: string;
    search?: string;
  }): Promise<AdminDestinationPage>;

  /**
   * Retrieves a single destination by ID
   * @param id - Destination ID
   * @returns Promise resolving to destination data
   */
  getDestination(id: number): Promise<AdminDestination>;

  /**
   * Creates a new destination
   * @param data - Destination creation data
   * @returns Promise resolving to created destination data
   */
  createDestination(data: CreateDestinationRequest): Promise<AdminDestination>;

  /**
   * Updates an existing destination
   * @param id - Destination ID
   * @param data - Destination update data
   * @returns Promise resolving to updated destination data
   */
  updateDestination(
    id: number,
    data: UpdateDestinationRequest,
  ): Promise<AdminDestination>;

  /**
   * Deletes a destination
   * @param id - Destination ID
   * @returns Promise that resolves when deletion is complete
   */
  deleteDestination(id: number): Promise<void>;

  getPendingReviews(params?: {
    page?: number;
    size?: number;
  }): Promise<AdminPendingReviewPage>;
  approveReview(ratingId: number): Promise<void>;
  rejectReview(ratingId: number): Promise<void>;

  getAdminHobbies(params?: {
    page?: number;
    size?: number;
    sort?: string;
    search?: string;
  }): Promise<AdminHobbyPage>;
  getAdminHobby(id: number): Promise<AdminHobby>;
  createAdminHobby(data: CreateAdminHobbyRequest): Promise<AdminHobby>;
  updateAdminHobby(
    id: number,
    data: CreateAdminHobbyRequest,
  ): Promise<AdminHobby>;
  patchAdminHobby(
    id: number,
    data: PatchAdminHobbyRequest,
  ): Promise<AdminHobby>;
  deleteAdminHobby(id: number): Promise<void>;

  getAdminLanguages(params?: {
    page?: number;
    size?: number;
    sort?: string;
    search?: string;
  }): Promise<AdminLanguagePage>;
  getAdminLanguage(langCode: string): Promise<AdminLanguage>;
  createAdminLanguage(data: CreateAdminLanguageRequest): Promise<AdminLanguage>;
  updateAdminLanguage(
    langCode: string,
    data: CreateAdminLanguageRequest,
  ): Promise<AdminLanguage>;
  patchAdminLanguage(
    langCode: string,
    data: PatchAdminLanguageRequest,
  ): Promise<AdminLanguage>;
  deleteAdminLanguage(langCode: string): Promise<void>;

  getAdminCountries(params?: {
    page?: number;
    size?: number;
    sort?: string;
    search?: string;
  }): Promise<AdminCountryPage>;
  getAdminCountry(isoCode: string): Promise<AdminCountry>;
  createAdminCountry(data: CreateAdminCountryRequest): Promise<AdminCountry>;
  updateAdminCountry(
    isoCode: string,
    data: CreateAdminCountryRequest,
  ): Promise<AdminCountry>;
  patchAdminCountry(
    isoCode: string,
    data: PatchAdminCountryRequest,
  ): Promise<AdminCountry>;
  deleteAdminCountry(isoCode: string): Promise<void>;

  getAuditLogs(params?: {
    page?: number;
    size?: number;
    sort?: string;
    search?: string;
    eventType?: CmsAuditEventType;
  }): Promise<CmsAuditLogPage>;
}

export const adminApi: {
  [K in keyof AdminApi]: (
    this: ApiClient,
    ...args: Parameters<AdminApi[K]>
  ) => ReturnType<AdminApi[K]>;
} = {
  async getUsers(this: ApiClient, params = {}) {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined)
      searchParams.append("page", params.page.toString());
    if (params.size !== undefined)
      searchParams.append("size", params.size.toString());
    if (params.sort) searchParams.append("sort", params.sort);
    if (params.search) searchParams.append("search", params.search);

    const query = searchParams.toString();
    const endpoint = `/admin/users${query ? `?${query}` : ""}`;

    const response = await this.request<AdminUserPage>(endpoint);
    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch users");
    }
    return response.data;
  },

  async getUser(this: ApiClient, id: number) {
    const response = await this.request<AdminUser>(`/admin/users/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch user");
    }
    return response.data;
  },

  async updateUserRole(
    this: ApiClient,
    id: number,
    role: "USER" | "ADMIN" | "HEAD_ADMIN",
  ) {
    const response = await this.request<AdminUser>(`/admin/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to update user role");
    }
    return response.data;
  },

  async getAdminDestinations(this: ApiClient, params = {}) {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined)
      searchParams.append("page", params.page.toString());
    if (params.size !== undefined)
      searchParams.append("size", params.size.toString());
    if (params.sort) searchParams.append("sort", params.sort);
    if (params.search) searchParams.append("search", params.search);

    const query = searchParams.toString();
    const endpoint = `/admin/destinations${query ? `?${query}` : ""}`;

    const response = await this.request<AdminDestinationPage>(endpoint);
    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch destinations");
    }
    return response.data;
  },

  async getDestination(this: ApiClient, id: number) {
    const response = await this.request<AdminDestination>(
      `/admin/destinations/${id}`,
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch destination");
    }
    return response.data;
  },

  async createDestination(this: ApiClient, data: CreateDestinationRequest) {
    const response = await this.request<AdminDestination>(
      "/admin/destinations",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to create destination");
    }
    return response.data;
  },

  async updateDestination(
    this: ApiClient,
    id: number,
    data: UpdateDestinationRequest,
  ) {
    const response = await this.request<AdminDestination>(
      `/admin/destinations/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to update destination");
    }
    return response.data;
  },

  async deleteDestination(this: ApiClient, id: number) {
    await this.request<void>(`/admin/destinations/${id}`, {
      method: "DELETE",
    });
  },

  async getPendingReviews(this: ApiClient, params = {}) {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined)
      searchParams.append("page", params.page.toString());
    if (params.size !== undefined)
      searchParams.append("size", params.size.toString());
    const query = searchParams.toString();
    const endpoint = `/admin/reviews/pending${query ? `?${query}` : ""}`;
    const response = await this.request<AdminPendingReviewPage>(endpoint);
    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch pending reviews");
    }
    return response.data;
  },

  async approveReview(this: ApiClient, ratingId: number) {
    await this.request<void>(`/admin/reviews/${ratingId}/approve`, {
      method: "POST",
    });
  },

  async rejectReview(this: ApiClient, ratingId: number) {
    await this.request<void>(`/admin/reviews/${ratingId}/reject`, {
      method: "POST",
    });
  },

  async getAdminHobbies(this: ApiClient, params = {}) {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined)
      searchParams.append("page", params.page.toString());
    if (params.size !== undefined)
      searchParams.append("size", params.size.toString());
    if (params.sort) searchParams.append("sort", params.sort);
    if (params.search) searchParams.append("search", params.search);
    const q = searchParams.toString();
    const res = await this.request<AdminHobbyPage>(
      `/admin/hobbies${q ? `?${q}` : ""}`,
    );
    if (!res.success || !res.data)
      throw new Error(res.error || "Failed to fetch hobbies");
    return res.data;
  },

  async getAdminHobby(this: ApiClient, id: number) {
    const res = await this.request<AdminHobby>(`/admin/hobbies/${id}`);
    if (!res.success || !res.data)
      throw new Error(res.error || "Failed to fetch hobby");
    return res.data;
  },

  async createAdminHobby(this: ApiClient, data: CreateAdminHobbyRequest) {
    const res = await this.request<AdminHobby>("/admin/hobbies", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res.success || !res.data)
      throw new Error(res.error || "Failed to create hobby");
    return res.data;
  },

  async updateAdminHobby(
    this: ApiClient,
    id: number,
    data: CreateAdminHobbyRequest,
  ) {
    const res = await this.request<AdminHobby>(`/admin/hobbies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (!res.success || !res.data)
      throw new Error(res.error || "Failed to update hobby");
    return res.data;
  },

  async patchAdminHobby(
    this: ApiClient,
    id: number,
    data: PatchAdminHobbyRequest,
  ) {
    const res = await this.request<AdminHobby>(`/admin/hobbies/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!res.success || !res.data)
      throw new Error(res.error || "Failed to update hobby");
    return res.data;
  },

  async deleteAdminHobby(this: ApiClient, id: number) {
    await this.request<void>(`/admin/hobbies/${id}`, { method: "DELETE" });
  },

  async getAdminLanguages(this: ApiClient, params = {}) {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined)
      searchParams.append("page", params.page.toString());
    if (params.size !== undefined)
      searchParams.append("size", params.size.toString());
    if (params.sort) searchParams.append("sort", params.sort);
    if (params.search) searchParams.append("search", params.search);
    const q = searchParams.toString();
    const res = await this.request<AdminLanguagePage>(
      `/admin/languages${q ? `?${q}` : ""}`,
    );
    if (!res.success || !res.data)
      throw new Error(res.error || "Failed to fetch languages");
    return res.data;
  },

  async getAdminLanguage(this: ApiClient, langCode: string) {
    const res = await this.request<AdminLanguage>(
      `/admin/languages/${encodeURIComponent(langCode)}`,
    );
    if (!res.success || !res.data)
      throw new Error(res.error || "Failed to fetch language");
    return res.data;
  },

  async createAdminLanguage(this: ApiClient, data: CreateAdminLanguageRequest) {
    const res = await this.request<AdminLanguage>("/admin/languages", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res.success || !res.data)
      throw new Error(res.error || "Failed to create language");
    return res.data;
  },

  async updateAdminLanguage(
    this: ApiClient,
    langCode: string,
    data: CreateAdminLanguageRequest,
  ) {
    const res = await this.request<AdminLanguage>(
      `/admin/languages/${encodeURIComponent(langCode)}`,
      { method: "PUT", body: JSON.stringify(data) },
    );
    if (!res.success || !res.data)
      throw new Error(res.error || "Failed to update language");
    return res.data;
  },

  async patchAdminLanguage(
    this: ApiClient,
    langCode: string,
    data: PatchAdminLanguageRequest,
  ) {
    const res = await this.request<AdminLanguage>(
      `/admin/languages/${encodeURIComponent(langCode)}`,
      { method: "PATCH", body: JSON.stringify(data) },
    );
    if (!res.success || !res.data)
      throw new Error(res.error || "Failed to update language");
    return res.data;
  },

  async deleteAdminLanguage(this: ApiClient, langCode: string) {
    await this.request<void>(
      `/admin/languages/${encodeURIComponent(langCode)}`,
      { method: "DELETE" },
    );
  },

  async getAdminCountries(this: ApiClient, params = {}) {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined)
      searchParams.append("page", params.page.toString());
    if (params.size !== undefined)
      searchParams.append("size", params.size.toString());
    if (params.sort) searchParams.append("sort", params.sort);
    if (params.search) searchParams.append("search", params.search);
    const q = searchParams.toString();
    const res = await this.request<AdminCountryPage>(
      `/admin/countries${q ? `?${q}` : ""}`,
    );
    if (!res.success || !res.data)
      throw new Error(res.error || "Failed to fetch countries");
    return res.data;
  },

  async getAdminCountry(this: ApiClient, isoCode: string) {
    const res = await this.request<AdminCountry>(
      `/admin/countries/${encodeURIComponent(isoCode)}`,
    );
    if (!res.success || !res.data)
      throw new Error(res.error || "Failed to fetch country");
    return res.data;
  },

  async createAdminCountry(this: ApiClient, data: CreateAdminCountryRequest) {
    const res = await this.request<AdminCountry>("/admin/countries", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res.success || !res.data)
      throw new Error(res.error || "Failed to create country");
    return res.data;
  },

  async updateAdminCountry(
    this: ApiClient,
    isoCode: string,
    data: CreateAdminCountryRequest,
  ) {
    const res = await this.request<AdminCountry>(
      `/admin/countries/${encodeURIComponent(isoCode)}`,
      { method: "PUT", body: JSON.stringify(data) },
    );
    if (!res.success || !res.data)
      throw new Error(res.error || "Failed to update country");
    return res.data;
  },

  async patchAdminCountry(
    this: ApiClient,
    isoCode: string,
    data: PatchAdminCountryRequest,
  ) {
    const res = await this.request<AdminCountry>(
      `/admin/countries/${encodeURIComponent(isoCode)}`,
      { method: "PATCH", body: JSON.stringify(data) },
    );
    if (!res.success || !res.data)
      throw new Error(res.error || "Failed to update country");
    return res.data;
  },

  async deleteAdminCountry(this: ApiClient, isoCode: string) {
    await this.request<void>(
      `/admin/countries/${encodeURIComponent(isoCode)}`,
      {
        method: "DELETE",
      },
    );
  },

  async getAuditLogs(this: ApiClient, params = {}) {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined)
      searchParams.append("page", params.page.toString());
    if (params.size !== undefined)
      searchParams.append("size", params.size.toString());
    if (params.sort) searchParams.append("sort", params.sort);
    if (params.search) searchParams.append("search", params.search);
    if (params.eventType) searchParams.append("eventType", params.eventType);
    const q = searchParams.toString();
    const res = await this.request<CmsAuditLogPage>(
      `/admin/audit-logs${q ? `?${q}` : ""}`,
    );
    if (!res.success || !res.data)
      throw new Error(res.error || "Failed to fetch audit logs");
    return res.data;
  },
};
