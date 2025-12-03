import type { CountryDto, HobbyDto, LanguageDto, VisitedCountryDto } from '@/types/user'

export type BackendUserDto = {
  id: number
  name: string
  surname?: string
  email: string
  role: string
  countryOfOrigin?: CountryDto
  hobbies?: HobbyDto[]
  languages?: LanguageDto[]
  visitedCountries?: VisitedCountryDto[]
  profileImage?: string
  dateOfRegister?: string
  dateOfLastSignin?: string
}


