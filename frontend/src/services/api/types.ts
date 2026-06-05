import type {
  CountryDto,
  HobbyDto,
  LanguageDto,
  VisitedCountryDto,
} from "@/types/user";

export type BackendUserDto = {
  id: number;
  name: string;
  surname?: string;
  email: string;
  role: string;
  countryOfOrigin?: CountryDto;
  hobbies?: HobbyDto[];
  languages?: LanguageDto[];
  visitedCountries?: VisitedCountryDto[];
  profileImagePath?: string;
  dateOfRegister?: string;
  dateOfLastSignin?: string;
  lastSignInMethod?: string;
  twoFactorVerified?: boolean;
};

export type BackendLinkedIdentityDto = {
  provider: string;
  label: string;
  linkedAt?: string;
};
