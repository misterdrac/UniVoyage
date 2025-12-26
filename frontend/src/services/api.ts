import { ApiClient } from './api/baseClient'
import { authApi, type AuthApi } from './api/authApi'
import { profileApi, type ProfileApi } from './api/profileApi'
import { tripsApi, type TripsApi, itineraryApi, type ItineraryApi } from './api/tripsApi'
import { destinationsApi, type DestinationsApi } from './api/destinationsApi'
import { weatherApi, type WeatherApi } from './api/weatherApi'

class ApiService extends ApiClient {}

Object.assign(ApiService.prototype, authApi, profileApi, tripsApi, itineraryApi, destinationsApi, weatherApi)

interface ApiService extends AuthApi, ProfileApi, TripsApi, ItineraryApi, DestinationsApi, WeatherApi {}

export const apiService = new ApiService()


