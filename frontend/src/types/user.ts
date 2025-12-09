export interface CountryDto {
  isoCode: string;
  countryName: string;
}

export interface HobbyDto {
  id: number;
  hobbyName: string;
}

export interface LanguageDto {
  langCode: string;
  langName: string;
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
  dateOfRegister?: string;
  dateOfLastSignin?: string;
}

