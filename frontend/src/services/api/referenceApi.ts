import type { ApiClient } from "./baseClient";

export interface ReferenceHobby {
  id: number;
  hobbyName: string;
  displayLabel: string;
  emoji: string | null;
  sortOrder: number;
}

export interface ReferenceLanguage {
  langCode: string;
  langName: string;
  emoji: string | null;
  sortOrder: number;
}

export interface ReferenceCountry {
  isoCode: string;
  countryName: string;
  currencyCode: string | null;
  currencyName: string | null;
  sortOrder: number;
}

export interface ReferenceApi {
  getReferenceHobbies(): Promise<ReferenceHobby[]>;
  getReferenceLanguages(): Promise<ReferenceLanguage[]>;
  getReferenceCountries(): Promise<ReferenceCountry[]>;
}

export const referenceApi: {
  [K in keyof ReferenceApi]: (
    this: ApiClient,
    ...args: Parameters<ReferenceApi[K]>
  ) => ReturnType<ReferenceApi[K]>;
} = {
  async getReferenceHobbies(this: ApiClient) {
    const response = await this.request<ReferenceHobby[]>("/reference/hobbies");
    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to load hobbies");
    }
    return response.data;
  },

  async getReferenceLanguages(this: ApiClient) {
    const response =
      await this.request<ReferenceLanguage[]>("/reference/languages");
    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to load languages");
    }
    return response.data;
  },

  async getReferenceCountries(this: ApiClient) {
    const response =
      await this.request<ReferenceCountry[]>("/reference/countries");
    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to load countries");
    }
    return response.data;
  },
};
