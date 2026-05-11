export interface CountryDto {
  isoCode: string;
  countryName: string;
}

export interface HobbyDto {
  id: number;
  hobbyName: string;
  /** CMS display label; falls back to hobbyName when absent */
  displayLabel?: string;
  emoji?: string | null;
}

export interface LanguageDto {
  langCode: string;
  langName: string;
  emoji?: string | null;
}

export interface VisitedCountryDto {
  isoCode: string;
  countryName: string;
  dateOfVisit: string;
}

export interface User {
  id: number;
  name: string;
  surname?: string;
  email: string;
  role: string;
  countryOfOrigin?: CountryDto;
  hobbies: HobbyDto[];
  languages: LanguageDto[];
  visitedCountries: VisitedCountryDto[];
  profileImagePath?: string;
  dateOfRegister?: string;
  dateOfLastSignin?: string;
}
