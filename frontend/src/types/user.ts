export interface CountryDto {
  isoCode: string;
  countryName: string;
}

export interface HobbyDto {
  id: number;
  name: string;
}

export interface LanguageDto {
  code: string;
  name: string;
}

export interface VisitedCountryDto {
  country: CountryDto;
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
  profileImage?: string;
  dateOfRegister?: string;
  dateOfLastSignin?: string;
}

